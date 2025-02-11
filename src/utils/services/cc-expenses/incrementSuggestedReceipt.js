'use server';

import { dynamoIncrementAttribute } from '../sdk-config/aws/dynamo-db';
import * as Sentry from '@sentry/nextjs';

import snackbarSuccessResponse from 'src/components/response-snackbar/utility/snackbarSuccessResponse';
import snackbarCatchErrorResponse from 'src/components/response-snackbar/utility/snackbarCatchErrorResponse';
import snackbarStatusErrorResponse from 'src/components/response-snackbar/utility/snackbarStatusErrorResponse';

export default async function incrementSuggestedReceipt({ pk }) {
  Sentry.setTag('functionName', 'incrementSuggestedReceipt');
  Sentry.addBreadcrumb({
    category: 'data',
    message: 'Data passed to incrementSuggestedReceipt',
    level: 'info',
    data: { pk },
  });

  const successTitle = 'Receipt Counter Incremented';
  const errorTitle = 'Error Incrementing Receipt Counter';

  try {
    const response = await dynamoIncrementAttribute({
      tableName: 'admin_portal_cc_suggested_receipts',
      pk,
      attributeName: 'numberOfTimesUsed',
      incrementBy: 1,
    });
    const responseStatus = response?.$metadata.httpStatusCode;
    const expectedStatus = 200;
    if (responseStatus === expectedStatus) {
      return snackbarSuccessResponse(response, successTitle);
    }
    return snackbarStatusErrorResponse(response, responseStatus, expectedStatus, errorTitle);
  } catch (error) {
    return snackbarCatchErrorResponse(error, errorTitle);
  }
}
