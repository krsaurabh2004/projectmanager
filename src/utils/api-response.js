class ApiResponse {
  constructor(StatusCode, Data, message = "success") {
    this.StatusCode = StatusCode;
    this.Data = Data;
    this.message = message;
    this.success = StatusCode < 400; //anything more than 400 will considerd as an error
  }
}

export default ApiResponse;
