const BASE_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,identification,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

export const generateAPIResponse = (info?: any) => {
  return {
    statusCode: info.statusCode,
    isBase64Encoded: false,
    headers: BASE_HEADERS,
    body: JSON.stringify(info || ""),
    // body: info || "",
  };
};