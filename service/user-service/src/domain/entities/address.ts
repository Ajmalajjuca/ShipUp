export class Address {
  constructor(
    public addressId: string,
    public type: 'home' | 'work' | 'other',
    public street: string,
    public isDefault: boolean,
    public userId: string,
    public latitude?: number,
    public longitude?: number,
    public streetNumber?: string,
    public buildingNumber?: string,
    public floorNumber?: string,
    public contactName?: string,
    public contactPhone?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
} 