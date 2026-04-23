#!/usr/bin/env node
/*
 * build-permission-dependency-map.js
 *
 * Input:  .claude/permission-dependency.txt
 *         Raw Workbench Tooling API QueryResult JSON from:
 *         SELECT Permission, PermissionType, RequiredPermission, RequiredPermissionType
 *         FROM PermissionDependency
 *
 * Output: force-app/main/default/staticresources/PermissionDependencyMap.json
 *         Grouped by source Permission, with transitive closure pre-computed
 *         and `attributes` stripped. Keys deduped on (permission, permissionType).
 *
 * Yearly refresh playbook:
 *   1. In a current production org, run the Workbench SOQL above against the Tooling API.
 *   2. Save the raw JSON response over .claude/permission-dependency.txt.
 *   3. node scripts/build-permission-dependency-map.js
 *   4. Review the diff on PermissionDependencyMap.json, commit, bump the package version,
 *      publish on AppExchange. Subscribers take no action — upgrade replaces the resource.
 *
 * Zero-dependency pure Node. Run with: node scripts/build-permission-dependency-map.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(REPO_ROOT, '.claude', 'permission-dependency.txt');
const OUTPUT_PATH = path.join(
    REPO_ROOT,
    'force-app', 'main', 'default', 'staticresources',
    'PermissionDependencyMap.json'
);

function readInput() {
    if (!fs.existsSync(INPUT_PATH)) {
        console.error(`ERROR: input file not found: ${INPUT_PATH}`);
        process.exit(1);
    }
    const raw = fs.readFileSync(INPUT_PATH, 'utf8');
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        console.error(`ERROR: input is not valid JSON: ${e.message}`);
        process.exit(1);
    }
    if (!parsed || !Array.isArray(parsed.records)) {
        console.error('ERROR: input JSON has no "records" array — expected Tooling QueryResult shape.');
        process.exit(1);
    }
    return parsed.records;
}

// Build `{ permission, permissionType }` → Set of direct required `{ permission, permissionType }`.
// Key both sides as "type::name" so (Account<read>, Object Permission) does not collide with
// any hypothetical user-permission named "Account<read>".
function keyOf(permission, permissionType) {
    return `${permissionType}::${permission}`;
}

function splitKey(key) {
    const idx = key.indexOf('::');
    return { permissionType: key.slice(0, idx), permission: key.slice(idx + 2) };
}

function buildAdjacency(records) {
    const adj = new Map();         // sourceKey → Map<reqKey, {permission, permissionType}>
    const sourceMeta = new Map();  // sourceKey → { permission, permissionType } (for stable output order)

    for (const r of records) {
        const perm = r.Permission;
        const permType = r.PermissionType;
        const reqPerm = r.RequiredPermission;
        const reqType = r.RequiredPermissionType;
        if (!perm || !permType || !reqPerm || !reqType) continue;

        const srcKey = keyOf(perm, permType);
        const reqKey = keyOf(reqPerm, reqType);

        if (!adj.has(srcKey)) adj.set(srcKey, new Map());
        if (!sourceMeta.has(srcKey)) sourceMeta.set(srcKey, { permission: perm, permissionType: permType });

        adj.get(srcKey).set(reqKey, { permission: reqPerm, permissionType: reqType });
    }
    return { adj, sourceMeta };
}

// DFS with cycle detection. Returns a Map<key, {permission, permissionType}> containing
// every permission reachable from startKey (direct + transitive), excluding startKey itself.
function transitiveClosure(startKey, adj, cyclesOut) {
    const closure = new Map();      // collected dependencies (what we return)
    const expanded = new Set();     // nodes whose edges we've already walked
    const onStack = new Set();      // current DFS path (for cycle detection)
    const stackPath = [];

    function dfs(nodeKey) {
        if (expanded.has(nodeKey)) return; // already walked this node's edges
        expanded.add(nodeKey);
        onStack.add(nodeKey);
        stackPath.push(nodeKey);

        const edges = adj.get(nodeKey);
        if (edges) {
            for (const [reqKey, reqMeta] of edges.entries()) {
                if (onStack.has(reqKey)) {
                    cyclesOut.push([...stackPath, reqKey].map(k => {
                        const m = splitKey(k);
                        return `${m.permission} [${m.permissionType}]`;
                    }).join(' → '));
                    continue;
                }
                if (!closure.has(reqKey)) closure.set(reqKey, reqMeta);
                dfs(reqKey); // walk reqKey's own edges — adds its requireds into closure
            }
        }
        onStack.delete(nodeKey);
        stackPath.pop();
    }

    dfs(startKey);
    closure.delete(startKey); // defensive — startKey is never its own dependency
    return closure;
}

function sortEntries(list) {
    return list.slice().sort((a, b) => {
        if (a.permissionType !== b.permissionType) {
            return a.permissionType < b.permissionType ? -1 : 1;
        }
        return a.permission < b.permission ? -1 : 1;
    });
}

function build() {
    const records = readInput();
    const { adj, sourceMeta } = buildAdjacency(records);

    const cycles = [];
    const dependencies = {};

    // Deterministic source order for stable JSON diffs across runs
    const sourceKeys = [...sourceMeta.keys()].sort();

    for (const srcKey of sourceKeys) {
        const src = sourceMeta.get(srcKey);
        const closure = transitiveClosure(srcKey, adj, cycles);
        const requires = sortEntries([...closure.values()]);

        // The node JSON key is "{permissionType}::{permission}" so that the same permission
        // name can exist under two different types without collision (rare but possible).
        // At runtime the Apex resolver splits this key when looking up.
        dependencies[srcKey] = {
            permission: src.permission,
            permissionType: src.permissionType,
            requires: requires
        };
    }

    const today = new Date();
    const version = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;

    const output = {
        version: version,
        generatedFrom: `Tooling API PermissionDependency, ${records.length} rows`,
        warnings: cycles.length > 0 ? cycles.map(c => `cycle detected: ${c}`) : [],
        dependencies: dependencies
    };

    // Pretty-print for reviewable diffs; Salesforce compresses static resources at upload.
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');

    // Summary to stdout
    const sourceCount = Object.keys(dependencies).length;
    const totalEdges = [...adj.values()].reduce((sum, m) => sum + m.size, 0);
    const totalClosureEdges = Object.values(dependencies).reduce((sum, n) => sum + n.requires.length, 0);
    console.log(`Read ${records.length} raw edges from ${path.relative(REPO_ROOT, INPUT_PATH)}`);
    console.log(`Grouped into ${sourceCount} source permissions`);
    console.log(`Direct edges: ${totalEdges}, after transitive closure: ${totalClosureEdges}`);
    if (cycles.length > 0) {
        console.log(`WARNING: ${cycles.length} cycle(s) detected — see "warnings" array in output`);
    }
    console.log(`Wrote ${path.relative(REPO_ROOT, OUTPUT_PATH)}`);
}

build();
