export const GRPC_ADDR = process.env.GRPC_ADDR
  ? process.env.GRPC_ADDR
  : "http://localhost:3001";

export const RESULT_ADDR = process.env.RESULT_ADDR
  ? process.env.RESULT_ADDR
  : "http://localhost:3002";

export const downloadSchemeFile = id => {
  window.open(`${RESULT_ADDR}/result_file/${id}`);
};

export const downloadCSVFile = fileName => {
  window.open(`${RESULT_ADDR}/csv_file/${fileName}`);
};

export const capitalizeFirstLetter = string => {
  return string[0].toUpperCase() + string.slice(1);
};
