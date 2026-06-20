import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  description: string;
  organizer: string;
  source_platform: string;        
  source_url: string;
  alternate_sources: { platform: string; url: string }[];
  category: string;               
  tags: string[];
  deadline: Date | null;
  start_date: Date | null;
  end_date: Date | null;
  location: string | null;
  is_remote: boolean;
  prize_info: string | null;
  eligibility: string | null;
  image_url: string | null;
  embedding: number[];            
  popularity_score: number;
  is_canonical: boolean;
  canonical_id: Types.ObjectId | null;
  viewCount: number;
  scraped_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    organizer: { type: String, required: true },
    source_platform: { type: String, required: true },
    source_url: { type: String, required: true },
    alternate_sources: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true }
      }
    ],
    category: { type: String, default: 'hackathon' },
    tags: { type: [String], default: [] },
    deadline: { type: Date, default: null },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    location: { type: String, default: null },
    is_remote: { type: Boolean, default: false },
    prize_info: { type: String, default: null },
    eligibility: { type: String, default: null },
    image_url: { type: String, default: null },
    embedding: { type: [Number], default: [] }, 
    popularity_score: { type: Number, default: 0 },
    is_canonical: { type: Boolean, default: true },
    canonical_id: { type: Schema.Types.ObjectId, ref: 'Opportunity', default: null },
    viewCount: { type: Number, default: 0 },
    scraped_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// We want to make sure exact match on source_url is unique, but it might exist across scraped entities
// Let's create an index.
OpportunitySchema.index({ source_url: 1 }, { unique: true });

const Opportunity = models.Opportunity || model<IOpportunity>('Opportunity', OpportunitySchema);

export default Opportunity;
