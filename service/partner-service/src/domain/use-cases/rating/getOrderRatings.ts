import { Rating } from "../../entities/rating";
import { RatingRepository } from "../../repositories/ratingRepository";

export interface GetOrderRatingsOutput {
    ratings: Rating[];
    averageRating: number;
    totalRatings: number;
}

export interface GetOrderRatingsInput {
    orderId: string;
}

export interface GetOrderRatingsUseCase {
    execute(input: GetOrderRatingsInput): Promise<GetOrderRatingsOutput>;
}

export class GetOrderRatingsUseCase{
    constructor(private ratingRepository: RatingRepository) {}

    async execute(input: GetOrderRatingsInput): Promise<GetOrderRatingsOutput> {
        const ratings = await this.ratingRepository.getByOrderId(input.orderId) ;
        console.log('ratings===>>', ratings);
        
        

        return {
    ratings: ratings ? [ratings] : [],
    totalRatings: ratings ? 1 : 0,
    averageRating: ratings ? ratings.rating : 0
  };
    }
}