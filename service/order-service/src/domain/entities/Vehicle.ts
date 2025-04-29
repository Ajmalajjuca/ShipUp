export type VehicleType = 'BIKE' | 'CAR' | 'VAN' | 'TRUCK';

export interface VehicleProps {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  maxWeight?: string | number;
  pricePerKm?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Vehicle {
  readonly id: string | undefined;
  readonly name: string;
  readonly description?: string;
  readonly imageUrl?: string;
  readonly isAvailable: boolean;
  readonly maxWeight?: string | number;
  readonly pricePerKm?: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: VehicleProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.isAvailable = props.isAvailable;
    this.maxWeight = props.maxWeight;
    this.pricePerKm = props.pricePerKm;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  // Domain methods
  public toggleAvailability(): Vehicle {
    return new Vehicle({
      ...this.toObject(),
      isAvailable: !this.isAvailable,
      updatedAt: new Date()
    });
  }

  public toggleActiveStatus(): Vehicle {
    return new Vehicle({
      ...this.toObject(),
      isActive: !this.isActive,
      updatedAt: new Date()
    });
  }

  public updateDetails(props: Partial<VehicleProps>): Vehicle {
    return new Vehicle({
      ...this.toObject(),
      ...props,
      updatedAt: new Date()
    });
  }

  public toObject(): VehicleProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      isAvailable: this.isAvailable,
      maxWeight: this.maxWeight,
      pricePerKm: this.pricePerKm,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 