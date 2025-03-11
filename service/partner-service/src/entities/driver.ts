export class Driver {
    constructor(
      public id: string,
      public name: string,
      public license: string,
      public status: 'pending' | 'approved' | 'rejected'
    ) {}
  }