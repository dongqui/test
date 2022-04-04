import { ServerResponse } from 'http';

const redirect = (res: ServerResponse, destination: string, statusCode = 302) => {
  if (res) {
    res.writeHead(statusCode, { Location: destination });
    res.end();
  }
};

export default redirect;
