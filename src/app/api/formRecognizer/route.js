// // https://github.com/Azure/azure-sdk-for-python/issues/31934

// import { NextResponse } from 'next/server';
// import { AZURE_FORM_RECOGNIZER } from 'src/config-global';

// import { fConverToNumber } from 'src/utils/format-number';
// import { fToCamelCase } from 'src/utils/format-string';

// const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
// const { generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential, BlobServiceClient} = require('@azure/storage-blob');


// export async function POST(request) {
//   const currentDateTime = new Date();
//   const batchId = currentDateTime.toISOString().replace(/Z$/, '_EST');

//   const {formApiKey} = AZURE_FORM_RECOGNIZER;
//   const {formEndpoint} = AZURE_FORM_RECOGNIZER;
//   const {storageConnectionString} = AZURE_FORM_RECOGNIZER;
//   const {storageContainer} = AZURE_FORM_RECOGNIZER;
//   const modelId = 'consumersmodel';

//   const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
//   const containerClient = blobServiceClient.getContainerClient(storageContainer);
//   const client = new DocumentAnalysisClient(formEndpoint, new AzureKeyCredential(formApiKey));

//   let sasToken;
//   try {
//     sasToken = generateContainerSASToken(storageContainer);
//   } catch (error) {
//     return NextResponse.json({ 
//       summary: 'Failed to retireve SAS Token',
//       message: error.message,
//       stack: error.stack,
//    }, { status: 500 });
//   }

//   const formData = await request.formData();
//   const results = [];
//   const errors = [];

//   for (const [fieldName, file] of formData.entries()) {
//     try {
//       // Upload File to Blob Storage
//       const fileName = file.name;
//       const fileBuffer = Buffer.from(await file.arrayBuffer());
//       const blobName = `submitted/${batchId}/${fileName}`;
//       const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//       await blockBlobClient.uploadData(fileBuffer);
//       const blobUrl = `${blockBlobClient.url}?${sasToken}`;

//       // Process File from Blob Storage
//       console.log('Starting file processing...');
//       const poller = await client.beginAnalyzeDocumentFromUrl(modelId, blobUrl);
//       const {documents} = await poller.pollUntilDone();

//       // Clean up response and push to results
//       const fields = transformOutput(documents[0].fields);
//       results.push(fields);
//     } catch (error) {
//       errors.push({
//         summary: `Error Processing file: ${file.name}`,
//         message: error.message,
//         stack: error.stack,
//       });
//     }
//   }

//   console.log('Everything Finished');
//   return NextResponse.json({ results, errors }, { status: 200 });
// }

// // generate SAS token for container

// function generateContainerSASToken(containerName) {
//   const sharedKeyCredential = new StorageSharedKeyCredential(
//     AZURE_FORM_RECOGNIZER.storageName,
//     AZURE_FORM_RECOGNIZER.storageKey
//   );
//   const containerSAS = generateBlobSASQueryParameters(
//     {
//       containerName,
//       permissions: BlobSASPermissions.parse('r'),
//       startsOn: new Date(),
//       expiresOn: new Date(new Date().valueOf() + 86400 * 1000),
//     },
//     sharedKeyCredential
//   ).toString();
//   return containerSAS;
// }


// // Transform Output to be cleaner

// function transformOutput (obj) {
//   const newObj = {};
//   for (const key in obj) {
//     const camelCaseKey = fToCamelCase(key);
//     let value = obj[key].content || null;
//     if (value ? obj[key].kind === 'number' : false) {
//       value = fConverToNumber(value);
//     }
//     newObj[camelCaseKey] = {
//       value,
//       confidence: obj[key].confidence,
//     };
//   }
//   return newObj;
// };