class ErrorHandeler extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export default ErrorHandeler;
