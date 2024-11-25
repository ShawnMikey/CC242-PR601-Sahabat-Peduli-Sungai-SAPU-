import { ClientError } from "@exceptions/ClientError";

export class InputError extends ClientError {
  constructor(message: string) {
    super(message);
    this.name = "InputError";

    Object.setPrototypeOf(this, InputError.prototype);
  }
}
