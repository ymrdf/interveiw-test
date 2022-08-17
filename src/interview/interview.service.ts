import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Interview } from './interview.model';

@Injectable()
export class InterviewService {
  constructor(
    @InjectModel(Interview)
    private interviewModel: typeof Interview,
  ) {}

  findOne(id: string): Promise<Interview> {
    return this.interviewModel.findOne({
      where: {
        id,
      },
    });
  }

  createOne(interviewerId: string): Promise<Interview> {
    return this.interviewModel.create({
      interviewerId,
    });
  }

  async updateOne(interviewerId: string, ob: any) {
    const interview = await this.interviewModel.findByPk(interviewerId);
    if (!interview) {
      throw new NotFoundException();
    }
    return interview.update({ ...ob });
  }
}
