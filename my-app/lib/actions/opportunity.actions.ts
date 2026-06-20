"use server"

import connectDB from "../mongodb";
import Opportunity from "../../database/opportunity.model";
import User from "../../database/user.model";
import { handleError } from "../utils";

// Types
export interface GetOpportunitiesParams {
  query?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export async function getOpportunities(params: GetOpportunitiesParams) {
  try {
    await connectDB();
    
    const { query, category, tags, page = 1, limit = 10 } = params;
    const skipAmount = (Number(page) - 1) * limit;

    const queryConditions: any = { is_canonical: true };

    if (query) {
      queryConditions.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { organizer: { $regex: query, $options: "i" } }
      ];
    }

    if (category) {
      queryConditions.category = category;
    }

    if (tags && tags.length > 0) {
      queryConditions.tags = { $in: tags };
    }

    const opportunities = await Opportunity.find(queryConditions)
      .sort({ scraped_at: -1, popularity_score: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalOpportunities = await Opportunity.countDocuments(queryConditions);

    return {
      opportunities: JSON.parse(JSON.stringify(opportunities)),
      isNext: totalOpportunities > skipAmount + opportunities.length,
      totalOpportunities,
    };
  } catch (error) {
    handleError(error);
  }
}

export async function getOpportunityById(id: string) {
  try {
    await connectDB();

    const opportunity = await Opportunity.findById(id);
    if (!opportunity) throw new Error("Opportunity not found");

    // Increment view count
    opportunity.viewCount += 1;
    await opportunity.save();

    return JSON.parse(JSON.stringify(opportunity));
  } catch (error) {
    handleError(error);
  }
}

export async function getNewSinceLastVisit(userEmail: string) {
  try {
    await connectDB();
    
    const user = await User.findOne({ email: userEmail });
    if (!user) return 0;
    
    if (!user.lastOpportunityVisit) {
      // First visit ever
      return await Opportunity.countDocuments({ is_canonical: true });
    }

    const newCount = await Opportunity.countDocuments({
      is_canonical: true,
      scraped_at: { $gt: user.lastOpportunityVisit }
    });

    return newCount;
  } catch (error) {
    handleError(error);
    return 0;
  }
}

export async function recordLastVisit(userEmail: string) {
  try {
    await connectDB();
    
    await User.findOneAndUpdate(
      { email: userEmail },
      { lastOpportunityVisit: new Date() }
    );
  } catch (error) {
    handleError(error);
  }
}

export async function getRecommendedOpportunities(userEmail: string, limit: number = 6) {
  try {
    await connectDB();
    
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) return { opportunities: [], isMLPowered: false };

    const userProfile = {
      email: (user as any).email,
      interests: (user as any).interests || [],
      preferredCategories: (user as any).preferredCategories || [],
      preferredMode: (user as any).preferredMode || "any",
      skillLevel: (user as any).skillLevel || "intermediate",
      bio: (user as any).bio || "",
    };

    const ML_URL = process.env.RECOMMENDATION_SERVICE_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${ML_URL}/recommend/opportunities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_profile: userProfile,
        limit,
      }),
      // Revalidate frequently to keep recommendations fresh
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const data = await response.json();
    
    // The ML service returns event_ids. We need to fetch the full canonical Opportunity docs.
    const oppIds = data.recommendations.map((r: any) => r.event_id);
    const fullOpps = await Opportunity.find({ _id: { $in: oppIds } }).lean();
    
    // Re-order based on ML scores
    const oppMap = new Map(fullOpps.map((o: any) => [o._id.toString(), o]));
    
    const finalRecommended = data.recommendations
      .map((rec: any) => {
        const opp = oppMap.get(rec.event_id);
        if (!opp) return null;
        return {
          opportunity: JSON.parse(JSON.stringify(opp)),
          score: rec.score,
          reason: rec.reason
        };
      })
      .filter(Boolean);

    return { opportunities: finalRecommended, isMLPowered: true };
    
  } catch (error) {
    console.warn("Vector Recommendation Fetch Error:", error instanceof Error ? error.message : String(error));
    return { opportunities: [], isMLPowered: false };
  }
}
