/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 *
 */

// Disable automatic export
export { };

// Handler
exports.handler = async (event: any) => {
  // Confirm the user
  event.response.autoConfirmUser = true;
  // Set the email as verified if it is in the request
  if (event.request.userAttributes.hasOwnProperty("email")) {
    event.response.autoVerifyEmail = true;
  }

  // Set the phone number as verified if it is in the request
  if (event.request.userAttributes.hasOwnProperty("phone_number")) {
    event.response.autoVerifyPhone = true;
  }

  return event;
};
