export class ResponseModel {
  constructor({ status, code, message, data }) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static create({ status, code, message, data }) {
    return new ResponseModel({ status, code, message, data });
  }
}
