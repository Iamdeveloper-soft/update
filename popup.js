let isEmailVerified = false; 
function fetchAllowedEmails(callback) {
    const sheetID = '1gRKDSNSsYLPZvy0z0GK1Bdnx0syNLWXz5oIBU6Yrx3Y'; 
    const apiKey = 'AIzaSyCKbJZPomNDZ1N1HhLJ2MpSAHqd_Z58PnI'; 
    const range = 'separator!A:A'; 
    const sheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}?key=${apiKey}`;

    fetch(sheetURL)
        .then(response => response.json())
        .then(data => {
            if (!data.values || data.values.length === 0) {
                alert('Contact with Owner for activation');
                callback([]);
                return;
            }
            const allowedEmails = data.values.map(row => row[0].trim().toLowerCase());
            callback(allowedEmails);
        })
        .catch(error => {
            console.error('Error fetching allowed emails:', error);
            alert('Failed to fetch allowed emails. Please check your API key or permissions.');
            callback([]); // Return an empty array on failure
        });
}

// Function to check the signed-in email against the allowed emails
function checkUserEmail(callback) {
    // First, fetch the allowed emails
    fetchAllowedEmails((allowedEmails) => {
        if (allowedEmails.length === 0) {
            callback(false); // If no allowed emails are fetched, deny access
            return;
        }

        // Get the user's signed-in email using Chrome Identity API
        chrome.identity.getProfileUserInfo((userInfo) => {
            if (chrome.runtime.lastError) {
                console.error("Error getting user information:", chrome.runtime.lastError.message);
                alert("Error verifying your email. Please try again.");
                callback(false);
                return;
            }

            // Normalize the fetched email and allowed emails
            const fetchedEmail = (userInfo.email || "").trim().toLowerCase();

            if (!fetchedEmail) {
                alert("Unable to fetch your email. Make sure you're logged in with the correct account.");
                callback(false);
                return;
            }

            // Check if the user's email is in the allowed list
            if (allowedEmails.includes(fetchedEmail)) {
                console.log("Email verified successfully:", fetchedEmail);
                isEmailVerified = true; // Update flag
                callback(true); // Invoke callback with success
            } else {
                console.warn("Access Denied: Email does not match.");
                alert("Contact with owner for activation,Muhammad ILYAS 0314627968.");
                isEmailVerified = false; // Update flag
                callback(false); // Invoke callback with failure
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // Function to switch screens
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    // Add event listeners to all buttons with data-target
    document.querySelectorAll('.button[data-target]').forEach(button => {
        button.addEventListener('click', () => {
            const targetScreen = button.getAttribute('data-target');
            showScreen(targetScreen);
        });
    });

   


// Function to extract matching values based on a regex pattern and limit the number of matches
function getMatches(numbers, regex, maxCount) {
    return numbers
        .map((num) => {
            if (typeof num === "string") {
                const match = num.match(regex);
                return match ? match[0] : null;
            }
            return null;
        })
        .filter(Boolean)
        .slice(0, maxCount); // Limits to the specified number of matches
}
voipCheckbox.addEventListener('change', () => {
    if (voipCheckbox.checked) {
        pagerCount.value = 0;  // Set Pager count to 0
        pagerCount.setAttribute('readonly', true);  // Make Pager count readonly
    } else {
        pagerCount.removeAttribute('readonly');  // Make Pager count editable again
    }
});
function processRow(list, wirelessCount, landlineCount, voipCount, pagerCount) {
    if (!list) return []; // If the list is empty, return an empty array

    const numbers = list.split("\n"); // Split list by new line

    // Get the checkbox states
    const isPagerCombinedWithWireless = document.getElementById("voipCheckbox").checked;
    const isVoipCombinedWithLandline = document.getElementById("voipLandlineCheckbox").checked;

    // Match wireless and Pager numbers conditionally
    const wirelessPager = isPagerCombinedWithWireless
        ? getMatches(numbers, /.* - (?:Wireless|Pager)/, wirelessCount)
        : getMatches(numbers, /.* - Wireless/, wirelessCount);
    
    // Match landline and VOIP numbers conditionally
    const landlineVoip = isVoipCombinedWithLandline
        ? getMatches(numbers, /.* - (?:Landline|VOIP)/, landlineCount)
        : getMatches(numbers, /.* - Landline/, landlineCount);

    // Match VOIP numbers explicitly if not combined
    const voip = (!isPagerCombinedWithWireless && !isVoipCombinedWithLandline)
        ? getMatches(numbers, /.* - VOIP/, voipCount)
        : [];

    // Match pager numbers
    const pagers = !isPagerCombinedWithWireless
        ? getMatches(numbers, /.* - Pager/, pagerCount)
        : [];

    // Fill missing slots with null for each category
    const fillerWirelessPager = Array(wirelessCount - wirelessPager.length).fill(null);
    const fillerLandlineVoip = Array(landlineCount - landlineVoip.length).fill(null);
    const fillerVoip = Array(voipCount - voip.length).fill(null);
    const fillerPagers = Array(pagerCount - pagers.length).fill(null);

    // Return the consolidated row data
    return [
        ...wirelessPager,
        ...fillerWirelessPager,
        ...landlineVoip,
        ...fillerLandlineVoip,
        ...voip,
        ...fillerVoip,
        ...pagers,
        ...fillerPagers,
    ];
}
// Function to process emails based on user input
function processEmails(data) {
    if (!data) return []; // If no data, return an empty array

    const emails = data.split("\n").map(email => email.trim()).filter(email => email); // Clean up the data

    // Initialize categories
    const categorizedEmails = {
        Gmail: [],
        Yahoo: [],
        Hotmail: [],
        Outlook: [],
        DotCom: [],
        DotNet: [],
        Other: []
    };

    // Categorize emails
    emails.forEach(email => {
        if (/@gmail\.com$/i.test(email)) {
            categorizedEmails.Gmail.push(email);
        } else if (/@yahoo\.com$/i.test(email)) {
            categorizedEmails.Yahoo.push(email);
        } else if (/@hotmail\.com$/i.test(email)) {
            categorizedEmails.Hotmail.push(email);
        } else if (/@outlook\.com$/i.test(email)) {
            categorizedEmails.Outlook.push(email);
        } else if (/\.com$/i.test(email)) {
            categorizedEmails.DotCom.push(email);
        } else if (/\.net$/i.test(email)) {
            categorizedEmails.DotNet.push(email);
        } else {
            categorizedEmails.Other.push(email);
        }
    });

    // Combine the categorized emails in the specified order
    const orderedEmails = [
        ...categorizedEmails.Gmail,
        ...categorizedEmails.Yahoo,
        ...categorizedEmails.Hotmail,
        ...categorizedEmails.Outlook,
        ...categorizedEmails.DotCom,
        ...categorizedEmails.DotNet,
        ...categorizedEmails.Other
    ];

    return orderedEmails;
}
// Function to handle file processing
function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Assuming data is in the first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (!jsonData || jsonData.length === 0) {
                alert("No data found in the selected file.");
                return;
            }

            // Check if the file has exactly two columns (numbers and emails)
            const isTwoColumns = jsonData[0].length === 2;

            // Get user-selected counts for wireless, landline, and email entries
            const wirelessCount = parseInt(document.getElementById("wirelessCount").value, 10);
            const landlineCount = parseInt(document.getElementById("landlineCount").value, 10);
            const voipCount = parseInt(document.getElementById("voipCount").value, 10);
            const pagerCount = parseInt(document.getElementById("pagerCount").value, 10);
            const emailCount = parseInt(document.getElementById("emailCount").value, 10);

            // Define headers based on whether the file has one or two columns
            const headers = [];
            for (let i = 1; i <= wirelessCount; i++) headers.push(`Wireless ${i}`);
            for (let i = 1; i <= landlineCount; i++) headers.push(`Landline ${i}`);
            for (let i = 1; i <= voipCount; i++) headers.push(`VOIP ${i}`);
            for (let i = 1; i <= pagerCount; i++) headers.push(`Pager ${i}`);
            if (isTwoColumns) {
                for (let i = 1; i <= emailCount; i++) headers.push(`Email ${i}`);
            }

            // Process each row, applying different logic based on column count
            const processedData = jsonData.map((row) => {
                const numberData = row[0]
                    ? processRow(row[0], wirelessCount, landlineCount, voipCount, pagerCount)
                    : [];
                const emailData = isTwoColumns && row[1] ? processEmails(row[1], emailCount) : [];
                return [...numberData, ...emailData];
            });

            // Ensure headers are added at the beginning of the processed data
            const outputData = [headers, ...processedData];
            // Convert processed data back to sheet format
            const newSheet = XLSX.utils.aoa_to_sheet(outputData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Processed Data");

            // Create a blob from the workbook and trigger download
            const wbout = XLSX.write(newWorkbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([wbout], { type: "application/octet-stream" });

            // Set up download link
            const downloadLink = document.getElementById("downloadLink");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "Processed_Data.xlsx";
            downloadLink.style.display = "block";
            downloadLink.textContent = "Download Processed File";
        } catch (error) {
            console.error("Error processing file:", error);
            alert("An error occurred while processing the file. Check the console for details.");
        }
    };

    reader.onerror = function () {
        alert("Failed to read the file.");
    };

    reader.readAsArrayBuffer(file);
}

// Event listener for the processing button
document.getElementById("processBtn").addEventListener("click", () => {
    // Check user email before processing data
    checkUserEmail((isVerified) => {
        if (!isVerified) {
            // If the email is not verified, do not proceed
            return;
        }

        // Continue to file processing if the email is verified
        const fileInput = document.getElementById("fileInput");
        if (!fileInput.files.length) {
            alert("Please select an XLSX file first.");
            return;
        }
        handleFile(fileInput.files[0]);
    });
});
});
// Function to process the uploaded XLSX file with user-defined column count
function handleSimpleTransposeFileWithColumns(file, columnCount) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            // Read the XLSX file data
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Assuming data is in the first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (!jsonData || jsonData.length === 0) {
                alert("No data found in the uploaded file.");
                return;
            }

            // Perform the Simple Transpose operation based on column count
            const result = jsonData.map(row => {
                if (!row || row[0] === undefined || row[0] === "") {
                    return Array(columnCount).fill(""); // Empty array with the desired column count
                }

                // Split data in the first column by line breaks
                const splitData = row[0].split("\n");

                // Extract the specified number of elements
                const extractedData = splitData.slice(0, columnCount);

                // Fill missing elements with empty strings
                while (extractedData.length < columnCount) {
                    extractedData.push("");
                }

                return extractedData;
            });

            // Convert the processed data back to an XLSX sheet
            const newSheet = XLSX.utils.aoa_to_sheet(result);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Simple Transpose Result");

            // Create a Blob and set up a download link
            const wbout = XLSX.write(newWorkbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([wbout], { type: "application/octet-stream" });

            const downloadLink = document.getElementById("simpleTransposeDownload");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "Simple_Transpose_Result.xlsx";
            downloadLink.style.display = "block";
            downloadLink.textContent = "Download Transposed File";
        } catch (error) {
            console.error("Error processing file:", error);
            alert("An error occurred while processing the file. Check the console for details.");
        }
    };

    reader.onerror = function () {
        alert("Failed to read the file.");
    };

    reader.readAsArrayBuffer(file);
}

// Event listener for the Simple Transpose file upload
document.getElementById("processSimpleTranspose").addEventListener("click", () => {
    // Check user email before processing data
    checkUserEmail((isVerified) => {
        if (!isVerified) {
            // If the email is not verified, do not proceed
            return;
        }

        const fileInput = document.getElementById("simpleTransposeFileInput");
        const columnCountInput = document.getElementById("columnCount");

        const file = fileInput.files[0];
        const columnCount = parseInt(columnCountInput.value, 10);

        if (!file) {
            alert("Please select an XLSX file first.");
            return;
        }

        if (isNaN(columnCount) || columnCount <= 0) {
            alert("Please enter a valid number for the column count.");
            return;
        }

        handleSimpleTransposeFileWithColumns(file, columnCount);
    });
});
function handleDataExtractionWithUserSelection(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (!jsonData || jsonData.length === 0) {
                alert("No data found in the uploaded file.");
                return;
            }

            // Get user selections
            const includeFirstLine = document.getElementById("includeFirstLine").checked;
            const extractPhone = document.getElementById("extractPhone").checked;
            const extractEmail = document.getElementById("extractEmail").checked;
            const extractAge = document.getElementById("extractAge").checked;
            const extractAddress = document.getElementById("extractAddress").checked;

            // Define headers dynamically based on user selection
            const headers = ["Original Content"];
            if (includeFirstLine) headers.push("NAME");
            if (extractPhone) headers.push("Phone Numbers");
            if (extractEmail) headers.push("Emails");
            if (extractAge) headers.push("Age");
            if (extractAddress) headers.push("Addresses");

            // Process data based on user selection
            const processedData = jsonData.map((row) => {
                if (!row || row[0] === undefined || row[0] === "") {
                    return [row[0] || "", ...(headers.slice(1).map(() => ""))];
                }

                const originalContent = row[0];
                const rowData = [originalContent];

                // Include first line if selected
                if (includeFirstLine) {
                    const firstLine = originalContent.split("\n")[0].trim();
                    rowData.push(firstLine || "");
                }

                // Extract phone numbers
                if (extractPhone) {
                    const labeledNumbersRegex = /\(\d{3}\) \d{3}-\d{4} - (Wireless|Landline|VOIP|Pager)/gi;
                    const phoneMatches = [...originalContent.matchAll(labeledNumbersRegex)];
                    const formattedNumbers = phoneMatches.map((match) => match[0]).join("\n");
                    rowData.push(formattedNumbers || "");
                }

                // Extract emails
                if (extractEmail) {
                    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
                    const emailMatches = originalContent.match(emailRegex) || [];
                    const emails = emailMatches.join("\n");
                    rowData.push(emails || "");
                }

                // Extract age
                if (extractAge) {
                    const ageMatch = originalContent.match(/.*\bAge\b.*$/im);
                    const age = ageMatch ? ageMatch[0].trim() : "";
                    rowData.push(age || "");
                }

                // Extract addresses
                if (extractAddress) {
                    const addressRegex = /^(.*?,.*?,.*?)(?:\n|$)/gm;
                    const addressMatches = [...originalContent.matchAll(addressRegex)];
                    const addresses = addressMatches.map((match) => match[1].trim()).join("\n");
                    rowData.push(addresses || "");
                }

                return rowData;
            });

            // Add headers to the output data
            const outputData = [headers, ...processedData];

            // Convert the processed data back to an XLSX sheet
            const newSheet = XLSX.utils.aoa_to_sheet(outputData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Extracted Data");

            // Create a Blob and set up a download link
            const wbout = XLSX.write(newWorkbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([wbout], { type: "application/octet-stream" });

            const downloadLink = document.getElementById("dataExtractorDownload");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "Extracted_Data_With_User_Selection.xlsx";
            downloadLink.style.display = "block";
            downloadLink.textContent = "Download Extracted Data";
        } catch (error) {
            console.error("Error processing file:", error);
            alert("An error occurred while processing the file. Check the console for details.");
        }
    };

    reader.onerror = function () {
        alert("Failed to read the file.");
    };

    reader.readAsArrayBuffer(file);
}

// Event listener for the "Data Extractor" button
document.getElementById("processDataExtractor").addEventListener("click", () => {
    // Check user email before processing data
    checkUserEmail((isVerified) => {
        if (!isVerified) {
            // If the email is not verified, do not proceed
            return;
        }

        const fileInput = document.getElementById("dataExtractorFileInput");

        if (!fileInput.files.length) {
            alert("Please select an XLSX file first.");
            return;
        }

        handleDataExtractionWithUserSelection(fileInput.files[0]);
    });
});
function processAddressRefiner(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Add headers for refined data
        const headers = ["Original Address", "Street", "City", "State", "Zipcode", "Error"];
        const refinedData = [headers];

        // Process each address
        rows.slice(1).forEach((row) => {
            const originalAddress = row[0]; // Assuming addresses are in the first column
            if (originalAddress) {
                const parsed = parseAddress(originalAddress);
                refinedData.push([
                    originalAddress,
                    parsed.Street || "",
                    parsed.City || "",
                    parsed.State || "",
                    parsed.Zipcode || "",
                    parsed.Error || ""
                ]);
            } else {
                refinedData.push([row[0], "", "", "", ""]);
            }
        });

        // Create a new sheet with refined data
        const refinedSheet = XLSX.utils.aoa_to_sheet(refinedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, refinedSheet, "Refined Addresses");

        // Write workbook as binary string
        const wbBinary = XLSX.write(newWorkbook, { bookType: "xlsx", type: "binary" });

        // Convert binary string to Blob
        const blob = new Blob([s2ab(wbBinary)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        // Create download link
        const downloadLink = document.getElementById("addressRefinerDownload");
        downloadLink.style.display = "inline-block";
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "Refined_Addresses.xlsx";
    };

    reader.readAsArrayBuffer(file);
}

// Helper function to convert binary string to ArrayBuffer
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
}

// Address parsing function
// Address parsing function
function parseAddress(address) {
    // Regex to capture street, city, state, and zip components
    const regex = /^(.+?\b(?:Rd|Dr|Pnes|St|Ave|Blvd|Ln|Trl|Ter|Ct|Way|Pl|NE|NW|SE|SW|Cir|Cv|Rdg|Xing|Hwy|Pkwy|Walk|Loop|Run|Crossing|Field|Hill|Valley|Heights|Circle|Point|Lane|Row|Trace|Place|Fork|Drive|Court|Alley|Alleyway|Bridge|Cove|Station|Summit|Trail|View|Vista|Bypass|Park|Meadow|Green|Ledge|Flat|Loop|Pass|Mall|Route|Box|Pines|Highway|Terrace|Crossing|Street|Road|Close|Lakes|Woods|Brook|Plaza|Glen|Creek|Run|Path|Hollow|Well)\b.*?)\s+([A-Za-z]+(?:\s[A-Za-z]+)*)\s+([A-Z]{2})\s+(\d{5})$/;
    const match = address.match(regex);
    if (match) {
        const city = match[2].trim().replace(/\b(?:NE|NW|SE|SW)\b/g, "").trim(); // Remove directional indicators
        return {
            Street: match[1].trim(),
            City: city,
            State: match[3].trim(),
            Zipcode: match[4].trim()
        };
    } else {
        return {
            Error: "",
            Original: address
        };
    }
}


// Event listener for Refine Addresses button
document.getElementById("processAddressRefiner").addEventListener("click", function (event) {
    event.preventDefault();
    
    // Check user email before processing address refinement
    checkUserEmail((isVerified) => {
        if (!isVerified) {
            // If the email is not verified, stop the process
            alert("Your email is not verified. Please verify your email to proceed.");
            return;
        }

        // Proceed if the email is verified
        const fileInput = document.getElementById("addressFileInput");
        const file = fileInput.files[0];

        if (!file) {
            alert("Please upload a file first!");
            return;
        }

        processAddressRefiner(file);
    });
})
