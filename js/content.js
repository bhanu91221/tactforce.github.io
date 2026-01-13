window.siteContent = {
    "meta": {
        "title": "TactForce - Expert Salesforce Solutions",
        "description": "Showcasing AppExchange Solutions Dynamic Path and Rocket Reports by TactForce, a Salesforce Partner."
    },
    "navigation": [
        {
            "label": "Home",
            "href": "index.html"
        },
        {
            "label": "Solutions",
            "href": "#solutions"
        },
        {
            "label": "Contact",
            "href": "#contact"
        }
    ],
    "hero": {
        "title": "Expert Salesforce Solutions",
        "subtitle": "Elevate your Salesforce experience with powerful AppExchange apps developed by TactForce, a proud Salesforce Partner.",
        "cta": "Explore Our Solutions",
        "ctaLink": "#solutions"
    },
    "about": {
        "title": "About Us",
        "text": [
            "We are dedicated Salesforce professionals focused on creating innovative solutions that solve real business challenges within the Salesforce ecosystem.",
            "As a registered Salesforce Partner, we adhere to the highest standards of development and customer success."
        ]
    },
    "products": [
        {
            "id": "dynamic-path",
            "name": "Dynamic Path",
            "description": "The Dynamic Path component enhances standard Path functionality and offers greater customizability for your Salesforce processes.",
            "features": [
                "Highly Customizable for both Standard and Custom Objects",
                "Group multiple picklist values in Path",
                "Display Key Fields on record update",
                "Remove check mark on completed & Customisable Guidance"
            ],
            "image": "images/dp.png",
            "appExchangeLink": "https://appexchange.salesforce.com/appxListingDetail?listingId=4255e60a-5080-4ec2-8461-01b7275a99b4",
            "guideLink": "guides.html?id=dynamic-path",
            "featured": false,
            "featuredName": "Popular Choice",
            "featuredIcon": "Heart"
        },
        {
            "id": "rocket-reports",
            "name": "Rocket Reports",
            "description": "Effortlessly schedule and send your vital Salesforce reports to any email address.",
            "features": [
                "Built entirely on the Salesforce platform using Apex and LWC",
                "Simple and Easy interface to Manage Subscriptions",
                "No External API calls"
            ],
            "image": "images/rr.png",
            "appExchangeLink": "https://appexchange.salesforce.com/appxListingDetail?listingId=4f304763-c601-4a00-823f-2a3d697fdce6",
            "guideLink": "guides.html?id=rocket-reports",
            "featured": false,
            "featuredName": "Popular Choice",
            "featuredIcon": "zap"
        }
    ],
    "features": {
        "title": "Why Choose Us",
        "heading": "Built for Success",
        "items": [
            {
                "icon": "zap",
                "iconColor": "blue",
                "title": "Lightning Fast",
                "description": "Built with performance in mind, our solutions deliver lightning-fast results without compromising functionality."
            },
            {
                "icon": "shield-check",
                "iconColor": "teal",
                "title": "Secure & Reliable",
                "description": "Enterprise-grade security built into every solution. Your data stays safe within Salesforce."
            },
            {
                "icon": "smile",
                "iconColor": "purple",
                "title": "Easy to Use",
                "description": "Intuitive interfaces designed for users of all technical levels. Get started in minutes, not hours."
            }
        ]
    },
    "contact": {
        "title": "Get In Touch",
        "subtitle": "Have questions about our solutions, need support, or interested in custom development? Contact us!",
        "formAction": "https://webto.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8&orgId=00Dau000004vwBR",
        "orgId": "00Dau000004vwBR",
        "retURL": "tactforce.ca",
        "supportEmail": "support@tactforce.ca"
    },
    "footer": {
        "copyright": "© 2025 TactForce. All Rights Reserved.",
        "buyMeCoffeeLink": "https://www.buymeacoffee.com/BhanuVakati",
        "buyMeCoffeeImage": "https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
    },
    "guides": {
        "dynamic-path": {
            "title": "Dynamic Path User Guide",
            "versions": [
                {
                    "version": "1.4",
                    "date": "2026-01-12",
                    "description": "UI Updates: Fixed Truncated path issue; New Feature: Option to Show Picklist Labels instead of API Names"
                },
                {
                    "version": "1.2",
                    "date": "2025-01-30",
                    "description": "Initial Production Release"
                }
            ],
            "sections": [
                {
                    "id": "introduction",
                    "title": "Introduction",
                    "content": "<p class=\"mb-4\">The Dynamic Path component enhances standard Salesforce Path functionality and offers greater customizability for your business processes. It allows for grouping path values, displaying key fields dynamically, and providing tailored guidance.</p>"
                },
                {
                    "id": "step-by-step-setup",
                    "title": "Step-by-Step Setup",
                    "content": "<p class=\"mb-4\">The Dynamic Path Package comes with preconfigured paths for Opportunity and Lead objects. You can also easily customize paths for any Standard or Custom object following these steps.</p><h3>1. Create Dynamic Path Config Records (Required)</h3><ol><li>Navigate to&nbsp;<code>Setup &gt; Custom Metadata Types</code>.</li><li>Click&nbsp;<code>Manage Records</code>&nbsp;next to \"Dynamic Path Config\".</li><li>Click&nbsp;<code>New</code>.</li><li>Fill in the required fields:</li></ol><ul><li class=\"ql-indent-1\"><strong>Label (Required):</strong>&nbsp;Provide a unique name (e.g., Opportunity Path).</li><li class=\"ql-indent-1\"><strong>Field API Name (Required):</strong>&nbsp;Enter the API name of the picklist field used for the path (e.g.,&nbsp;<code>StageName</code>).</li><li class=\"ql-indent-1\"><strong>Object API Name (Required):</strong>&nbsp;Specify the API name of the Salesforce object (e.g.,&nbsp;<code>Opportunity</code>).</li></ul><ol><li>Click&nbsp;<code>Save</code>.</li></ol><h3>2. Create Dynamic Path Value Config Records (Optional)</h3><p class=\"mb-4\">Creating these configurations is optional. Only create them if you need to customize the behavior or appearance of specific values within your path (e.g., grouping, key fields, guidance).</p><ol><li>Navigate to&nbsp;<code>Setup &gt; Custom Metadata Types</code>.</li><li>Click&nbsp;<code>Manage Records</code>&nbsp;next to \"Dynamic Path Value Config\".</li><li>Click&nbsp;<code>New</code>.</li><li>Fill in the fields as needed:</li></ol><ul><li class=\"ql-indent-1\"><strong>Label (Required):</strong>&nbsp;Enter the exact API name of the picklist value (e.g.,&nbsp;<code>Prospecting</code>).</li><li class=\"ql-indent-1\"><strong>Dynamic Path Config (Required):</strong>&nbsp;Select the corresponding Dynamic Path Config record created in step 1 using the lookup.</li><li class=\"ql-indent-1\"><strong>Group Label (Optional):</strong>&nbsp;Enter a label to group this value with others under a common heading in the path.</li><li class=\"ql-indent-1\"><strong>Key Fields (Optional):</strong>&nbsp;Provide a semi-colon separated list of field API names (up to five) to display when this path value is active (e.g.,&nbsp;<code>Amount;CloseDate</code>).</li><li class=\"ql-indent-1\"><strong>Guidance Body (Optional):</strong>&nbsp;Enter rich text guidance to display for this path value.</li><li class=\"ql-indent-1\"><strong>Is Closed (Optional):</strong>&nbsp;Check this box if this value represents a \"Closed Won\" or equivalent terminal success state.</li><li class=\"ql-indent-1\"><strong>Is Lost (Optional):</strong>&nbsp;Check this box if this value represents a \"Closed Lost\" or equivalent terminal failure state.</li></ul><ol><li>Click&nbsp;<code>Save</code>. Repeat for other values needing customization.</li></ol>"
                },
                {
                    "id": "add-component",
                    "title": "Add the Dynamic Path Component to a Record Page",
                    "content": "<ol><li>Navigate to a record page of the object you configured (e.g., an Opportunity record).</li><li>Click the&nbsp;<code>Setup</code>&nbsp;gear icon in the top right and select&nbsp;<code>Edit Page</code>.</li><li>In the Lightning App Builder, find the&nbsp;<code>Dynamic Path</code>&nbsp;component under the \"Custom\" components section on the left panel.</li><li>Drag the&nbsp;<code>Dynamic Path</code>&nbsp;component onto the desired location on your page layout (often near the top).</li></ol>"
                },
                {
                    "id": "configure-component",
                    "title": "Configure the Component Properties",
                    "content": "<p class=\"mb-2\">Once the component is placed on the page, click on it to configure its properties in the right-hand panel:</p><ul><li><strong>Dynamic Path Configuration (Required):</strong>&nbsp;Select the specific \"Dynamic Path Config\" record you created in Step 1 from the dropdown list. This tells the component which path to display.</li><li><strong>Path Type:</strong>&nbsp;Choose \"Linear\" (standard progression) or \"Non-Linear\" (allows moving back and forth more freely, appearance might differ slightly).</li><li><strong>Hide Path Button:</strong>&nbsp;Check this box if you want to hide the \"Mark Stage as Complete\" (or similar) button.</li><li><strong>Path Button Custom Text:</strong>&nbsp;If the button is not hidden, you can enter custom text for it here (e.g., \"Update Status\").</li><li><strong>Has Guidance:</strong>&nbsp;Check this box to enable the display of guidance text defined in the \"Dynamic Path Value Config\" records.</li><li><strong>Remove Check Mark on Completed:</strong>&nbsp;By default (unchecked), completed stages show a checkmark. Check this box to remove the checkmark icon from completed stages.</li></ul><p>After configuring, click&nbsp;<code>Save</code>&nbsp;in the Lightning App Builder. You may also need to click&nbsp;<code>Activate</code>&nbsp;to assign the updated page layout to the relevant profiles or apps.</p>"
                },
                {
                    "id": "important-tips",
                    "title": "Important Tips",
                    "content": "<p><strong>Save and Activate:</strong>&nbsp;Always remember to Save your changes in the Lightning App Builder and Activate the page if necessary.</p><p><strong>Testing:</strong>&nbsp;Test thoroughly in a Salesforce Sandbox environment before deploying to Production.</p><p><strong>Picklist Fields:</strong>&nbsp;The component is primarily designed to work with picklist fields.</p><p><strong>Value Configs:</strong>&nbsp;Dynamic Path Value Config records are only needed if you want to customize specific path values (grouping, key fields, guidance, closed/lost status).</p><p><strong>No Duplicates:</strong>&nbsp;Ensure you don't create duplicate Dynamic Path Value Config records for the same picklist value within the same Path Config.</p><p><strong>Key Fields Usage:</strong>&nbsp;Use the \"Key Fields\" feature strategically to prompt users for critical information at specific stages.</p><p><strong>Guidance Rich Text:</strong>&nbsp;The \"Guidance Body\" field supports Salesforce Rich Text markup for formatting.</p><p><strong>Apex Class Permission:</strong>&nbsp;If the package was initially installed for 'Admins Only' and later reinstalled for 'All Users', you might encounter an issue where the necessary Apex classes are not automatically added to non-admin profiles; therefore, manually add \"DynamicPathController\" and \"DynamicPathConfigsList\" to Apex Class Access in profile or a permission set (thanks to Jimmy Martin)</p>"
                }
            ]
        },
        "rocket-reports": {
            "title": "Rocket Reports User Guide",
            "versions": [
                {
                    "version": "2.0",
                    "date": "2026-01-23",
                    "description": "Feature Release: Supports Multiple Reports in a Scheduled; Improved error logging"
                },
                {
                    "version": "1.6",
                    "date": "2025-10-24",
                    "description": "New Feature: Customizable Email Subject and Body"
                },
                {
                    "version": "1.4",
                    "date": "2025-07-30",
                    "description": "Critical Scheduled flow Issue Fix"
                },
                {
                    "version": "1.3",
                    "date": "2025-03-02",
                    "description": "Critical Screen Flow Issue Fix"
                },
                {
                    "version": "1.0",
                    "date": "2025-02-23",
                    "description": "Initial Production Release"
                }
            ],
            "sections": [
                {
                    "id": "introduction",
                    "title": "Introduction",
                    "content": "<p class=\"mb-4\">Rocket Reports provides robust report subscription capabilities, allowing administrators to automatically email Salesforce reports as attachments (.csv or .xlsx) to any internal or external email address.</p><p class=\"mb-4\"><br></p><p class=\"mb-4\">Built entirely on the Salesforce platform using Apex and Lightning Web Components (LWC), Rocket Reports operates securely within your organization. It makes no external API calls, ensuring all data processing occurs safely within Salesforce.</p><p class=\"mb-4\"><br></p><p class=\"mb-4\">To get started, navigate to the&nbsp;<strong>Rocket Reports</strong>&nbsp;App page from the Salesforce App Launcher.</p>"
                },
                {
                    "id": "creating-subscriptions",
                    "title": "Creating Subscriptions",
                    "content": "<p class=\"mb-2\">From the Rocket Reports app page, click the&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">Create Report Subscription</code>&nbsp;button. This action launches a screen flow designed to guide you through the subscription setup process.</p><p class=\"mb-2\">Fill in the following details within the flow:</p><ul><li><strong>Report Subscription Name (Text):</strong>&nbsp;Enter a descriptive name for easy identification (e.g., \"Weekly Sales Report - EMEA Team\").</li><li><strong>Report Attachment Type (Picklist):</strong>&nbsp;Select the desired format for the emailed report attachment:&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">.csv</code>&nbsp;or&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">.xlsx</code>.</li><li><strong>Report (Lookup):</strong>&nbsp;Choose the specific Salesforce report you want to subscribe to from the list of available reports in your org.</li><li><strong>Send to (Emails):</strong>&nbsp;Enter the email addresses of the recipients. You can add multiple email addresses, separated by commas or semicolons (check the field help text for the exact separator). Both internal Salesforce users and external email addresses are supported.</li></ul><p>After filling in these details, proceed through the flow (which includes the Scheduler Section described below) and click&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">Save</code>&nbsp;or&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">Finish</code>&nbsp;to create and activate the subscription.</p>"
                },
                {
                    "id": "scheduler",
                    "title": "Scheduler",
                    "content": "<p>Within the subscription creation flow (or when editing an existing subscription), you'll encounter the Scheduler Section. This is where you define how frequently the report subscription should run and email the report.</p><p><br></p><p class=\"mt-2\">Configure the desired frequency (e.g., daily, weekly on specific days, monthly on a specific date) and the preferred start time for the subscription to run.</p>"
                },
                {
                    "id": "limits",
                    "title": "Accessing and Managing Subscriptions",
                    "content": "<p>You can view and manage all created subscriptions directly from the Rocket Reports app page. Use the standard Salesforce list views (e.g., \"Active Subscriptions\", \"Inactive Subscriptions\", \"All Subscriptions\") to filter and find specific subscriptions.</p><p><br></p><p>Click on a subscription name to view its details, edit its configuration (including schedule and recipients), activate/deactivate it, or delete it.</p>"
                },
                {
                    "id": "manual-report-trigger",
                    "title": "Manual Report Trigger",
                    "content": "<p>For ad-hoc needs or testing, you can manually trigger a specific subscription to run immediately.</p><p><br></p><p>Navigate to the detail page of the desired Report Subscription record. Click the&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">Send Report Now</code>&nbsp;Quick Action button. This will execute the subscription once and email the report to the configured recipients, regardless of the scheduled time.</p>"
                },
                {
                    "id": "activity-logging",
                    "title": "Activity Logging",
                    "content": "<p>Rocket Reports automatically logs activity for troubleshooting and auditing purposes. Every time a report subscription runs and attempts to send an email, a Task record is created and linked to the corresponding Report Subscription record.</p><p><br></p><p>You can view these logs in the \"Activity\" related list on the Report Subscription record's page. These logs contain details about the execution, including whether the email was sent successfully and, if applicable, may include error messages. The sent email itself (with the attachment) might also be logged here, depending on your Salesforce email logging settings.</p>"
                },
                {
                    "id": "good-to-know",
                    "title": "Good to Know",
                    "content": "<p><strong>Permissions:</strong>&nbsp;We highly recommend while Installing select \"Install for Admins Only\". Assign the permissions set \"Rocket Reports Admin\" for designated users responsible for managing report subscriptions if needed.</p><p><br></p><p><strong>Platform Limits:</strong>&nbsp;Rocket Reports utilizes Schedulable Apex classes. Standard Salesforce governor limits for Apex execution, email sending, and asynchronous processing apply. Please familiarize yourself with these limits.</p><p><br></p><p><strong>Custom Object:</strong>&nbsp;The subscription details are stored in a custom object named&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">Rocket Report Subscription</code>&nbsp;(or similar - check package details). You can access this object directly via the App Launcher or Object Manager if needed.</p><p><br></p><p><strong>Joined Reports:</strong>&nbsp;Subscription to Joined Reports is supported but, make sure to select&nbsp;<code style=\"background-color: rgb(238, 244, 255);\">Formatted (XLSX)</code>&nbsp;as the report attachment type.</p>"
                }
            ]
        }
    }
};