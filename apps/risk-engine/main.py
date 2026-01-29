"""
Villa Homes Predictive Risk Engine
AI-powered risk detection and prediction for construction projects
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Villa Risk Engine",
    description="Predictive Risk Engine for Villa Homes Construction Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ProjectRiskInput(BaseModel):
    project_id: str
    project_name: str
    current_phase: str
    days_in_phase: int
    budget_total: float
    budget_spent: float
    tasks_total: int
    tasks_completed: int
    tasks_blocked: int
    subcontractor_count: int
    subcontractor_avg_rating: float
    client_sentiment_score: float  # -1 to 1
    weather_delay_days: int
    permit_status: str
    last_communication_days: int

class RiskPrediction(BaseModel):
    project_id: str
    overall_risk_score: float  # 0-100
    risk_level: str  # low, medium, high, critical
    confidence: float  # 0-1
    schedule_risk: float
    budget_risk: float
    client_risk: float
    subcontractor_risk: float
    factors: List[dict]
    recommendations: List[str]
    predicted_delay_days: int
    predicted_cost_overrun: float

class CallAnalysisInput(BaseModel):
    call_id: str
    transcription: str
    caller_type: str  # homeowner, subcontractor, vendor
    project_id: Optional[str] = None

class CallAnalysisResult(BaseModel):
    call_id: str
    sentiment_score: float  # -1 to 1
    risk_detected: bool
    risk_keywords: List[str]
    summary: str
    action_items: List[str]
    urgency: str  # low, medium, high

class EstimateInput(BaseModel):
    project_type: str  # custom_home, renovation, commercial
    square_footage: float
    location: str
    features: List[str]
    quality_level: str  # standard, premium, luxury

class EstimateResult(BaseModel):
    estimated_cost: float
    confidence: float
    cost_range_low: float
    cost_range_high: float
    breakdown: dict
    similar_projects: List[dict]
    risk_factors: List[dict]

# Risk calculation algorithms
def calculate_schedule_risk(data: ProjectRiskInput) -> tuple[float, List[dict]]:
    """Calculate schedule risk based on project metrics"""
    factors = []
    risk = 0.0
    
    # Task completion rate
    if data.tasks_total > 0:
        completion_rate = data.tasks_completed / data.tasks_total
        if completion_rate < 0.3:
            risk += 25
            factors.append({"factor": "Low task completion", "impact": 25, "detail": f"Only {completion_rate*100:.0f}% tasks completed"})
        elif completion_rate < 0.5:
            risk += 15
            factors.append({"factor": "Below target completion", "impact": 15, "detail": f"{completion_rate*100:.0f}% tasks completed"})
    
    # Blocked tasks
    if data.tasks_blocked > 0:
        blocked_impact = min(data.tasks_blocked * 5, 30)
        risk += blocked_impact
        factors.append({"factor": "Blocked tasks", "impact": blocked_impact, "detail": f"{data.tasks_blocked} tasks blocked"})
    
    # Weather delays
    if data.weather_delay_days > 0:
        weather_impact = min(data.weather_delay_days * 3, 25)
        risk += weather_impact
        factors.append({"factor": "Weather delays", "impact": weather_impact, "detail": f"{data.weather_delay_days} days lost to weather"})
    
    # Permit status
    if data.permit_status in ["in_review", "rejected"]:
        risk += 20
        factors.append({"factor": "Permit issues", "impact": 20, "detail": f"Permit status: {data.permit_status}"})
    
    # Days in phase (stagnation)
    phase_thresholds = {
        "pre_construction": 30, "site_prep": 14, "foundation": 21,
        "framing": 28, "roofing": 14, "rough_in": 21,
        "insulation": 7, "drywall": 14, "interior_finish": 28,
        "exterior_finish": 21, "final_completion": 14
    }
    threshold = phase_thresholds.get(data.current_phase, 21)
    if data.days_in_phase > threshold:
        stagnation_impact = min((data.days_in_phase - threshold) * 2, 25)
        risk += stagnation_impact
        factors.append({"factor": "Phase stagnation", "impact": stagnation_impact, "detail": f"{data.days_in_phase} days in {data.current_phase} (threshold: {threshold})"})
    
    return min(risk, 100), factors

def calculate_budget_risk(data: ProjectRiskInput) -> tuple[float, List[dict]]:
    """Calculate budget risk based on spending patterns"""
    factors = []
    risk = 0.0
    
    if data.budget_total > 0:
        spend_rate = data.budget_spent / data.budget_total
        completion_rate = data.tasks_completed / max(data.tasks_total, 1)
        
        # Overspending relative to progress
        if spend_rate > completion_rate + 0.15:
            overspend_impact = min((spend_rate - completion_rate) * 100, 40)
            risk += overspend_impact
            factors.append({
                "factor": "Overspending vs progress",
                "impact": overspend_impact,
                "detail": f"Spent {spend_rate*100:.0f}% but only {completion_rate*100:.0f}% complete"
            })
        
        # Near budget limit
        if spend_rate > 0.85:
            risk += 20
            factors.append({"factor": "Near budget limit", "impact": 20, "detail": f"{spend_rate*100:.0f}% of budget used"})
        
        # Already over budget
        if spend_rate > 1.0:
            risk += 30
            factors.append({"factor": "Over budget", "impact": 30, "detail": f"{(spend_rate-1)*100:.0f}% over budget"})
    
    return min(risk, 100), factors

def calculate_client_risk(data: ProjectRiskInput) -> tuple[float, List[dict]]:
    """Calculate client satisfaction risk"""
    factors = []
    risk = 0.0
    
    # Sentiment score
    if data.client_sentiment_score < 0:
        sentiment_impact = abs(data.client_sentiment_score) * 40
        risk += sentiment_impact
        factors.append({"factor": "Negative sentiment", "impact": sentiment_impact, "detail": f"Sentiment score: {data.client_sentiment_score:.2f}"})
    elif data.client_sentiment_score < 0.3:
        risk += 15
        factors.append({"factor": "Low satisfaction", "impact": 15, "detail": f"Sentiment score: {data.client_sentiment_score:.2f}"})
    
    # Communication gap
    if data.last_communication_days > 7:
        comm_impact = min((data.last_communication_days - 7) * 3, 25)
        risk += comm_impact
        factors.append({"factor": "Communication gap", "impact": comm_impact, "detail": f"{data.last_communication_days} days since last contact"})
    
    return min(risk, 100), factors

def calculate_subcontractor_risk(data: ProjectRiskInput) -> tuple[float, List[dict]]:
    """Calculate subcontractor reliability risk"""
    factors = []
    risk = 0.0
    
    # Low ratings
    if data.subcontractor_avg_rating < 3.5:
        rating_impact = (4.0 - data.subcontractor_avg_rating) * 20
        risk += rating_impact
        factors.append({"factor": "Low sub ratings", "impact": rating_impact, "detail": f"Avg rating: {data.subcontractor_avg_rating:.1f}/5"})
    
    # Too few subs (dependency risk)
    if data.subcontractor_count < 3:
        risk += 15
        factors.append({"factor": "Limited sub pool", "impact": 15, "detail": f"Only {data.subcontractor_count} subcontractors"})
    
    return min(risk, 100), factors

def generate_recommendations(schedule_risk: float, budget_risk: float, client_risk: float, sub_risk: float, factors: List[dict]) -> List[str]:
    """Generate actionable recommendations based on risk factors"""
    recommendations = []
    
    if schedule_risk > 50:
        recommendations.append("Schedule a project recovery meeting with all stakeholders")
        recommendations.append("Consider adding additional crew or overtime to recover schedule")
    
    if budget_risk > 50:
        recommendations.append("Review all pending change orders and approve only critical items")
        recommendations.append("Conduct cost-to-complete analysis and update forecast")
    
    if client_risk > 40:
        recommendations.append("Schedule an in-person meeting with the homeowner")
        recommendations.append("Prepare detailed progress report with photos")
    
    if sub_risk > 40:
        recommendations.append("Review subcontractor performance and consider backup options")
        recommendations.append("Schedule coordination meeting with underperforming subs")
    
    # Factor-specific recommendations
    for factor in factors:
        if "blocked" in factor.get("factor", "").lower():
            recommendations.append("Identify and resolve task blockers immediately")
        if "permit" in factor.get("factor", "").lower():
            recommendations.append("Escalate permit issues with jurisdiction")
        if "weather" in factor.get("factor", "").lower():
            recommendations.append("Review weather contingency plan and adjust schedule")
    
    return recommendations[:5]  # Top 5 recommendations

# API Endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "villa-risk-engine", "version": "1.0.0"}

@app.post("/api/v1/predict-risk", response_model=RiskPrediction)
async def predict_project_risk(data: ProjectRiskInput):
    """Predict risk levels for a construction project"""
    
    # Calculate individual risk components
    schedule_risk, schedule_factors = calculate_schedule_risk(data)
    budget_risk, budget_factors = calculate_budget_risk(data)
    client_risk, client_factors = calculate_client_risk(data)
    sub_risk, sub_factors = calculate_subcontractor_risk(data)
    
    # Combine all factors
    all_factors = schedule_factors + budget_factors + client_factors + sub_factors
    
    # Calculate overall risk (weighted average)
    overall_risk = (
        schedule_risk * 0.35 +
        budget_risk * 0.30 +
        client_risk * 0.20 +
        sub_risk * 0.15
    )
    
    # Determine risk level
    if overall_risk >= 75:
        risk_level = "critical"
    elif overall_risk >= 50:
        risk_level = "high"
    elif overall_risk >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    # Generate recommendations
    recommendations = generate_recommendations(schedule_risk, budget_risk, client_risk, sub_risk, all_factors)
    
    # Predict delay and cost overrun
    predicted_delay = int(schedule_risk * 0.3)  # Rough estimate
    predicted_overrun = budget_risk * data.budget_total * 0.001  # Rough estimate
    
    return RiskPrediction(
        project_id=data.project_id,
        overall_risk_score=round(overall_risk, 1),
        risk_level=risk_level,
        confidence=0.85,  # Model confidence
        schedule_risk=round(schedule_risk, 1),
        budget_risk=round(budget_risk, 1),
        client_risk=round(client_risk, 1),
        subcontractor_risk=round(sub_risk, 1),
        factors=sorted(all_factors, key=lambda x: x["impact"], reverse=True)[:5],
        recommendations=recommendations,
        predicted_delay_days=predicted_delay,
        predicted_cost_overrun=round(predicted_overrun, 2)
    )

@app.post("/api/v1/analyze-call", response_model=CallAnalysisResult)
async def analyze_call(data: CallAnalysisInput):
    """Analyze a call transcription for sentiment and risk indicators"""
    
    transcription_lower = data.transcription.lower()
    
    # Risk keywords detection
    risk_keywords = []
    keyword_patterns = {
        "delay": ["delay", "delayed", "behind", "late", "waiting"],
        "budget": ["budget", "cost", "expensive", "over budget", "money"],
        "unhappy": ["unhappy", "disappointed", "frustrated", "angry", "upset"],
        "change": ["change", "modify", "different", "not what"],
        "problem": ["problem", "issue", "wrong", "broken", "failed"],
    }
    
    for category, keywords in keyword_patterns.items():
        for keyword in keywords:
            if keyword in transcription_lower:
                risk_keywords.append(keyword)
    
    # Simple sentiment analysis
    positive_words = ["great", "happy", "excellent", "perfect", "love", "thank", "appreciate", "good", "wonderful"]
    negative_words = ["bad", "terrible", "awful", "hate", "disappointed", "frustrated", "angry", "upset", "wrong", "problem"]
    
    positive_count = sum(1 for word in positive_words if word in transcription_lower)
    negative_count = sum(1 for word in negative_words if word in transcription_lower)
    
    total = positive_count + negative_count
    if total > 0:
        sentiment_score = (positive_count - negative_count) / total
    else:
        sentiment_score = 0.0
    
    # Risk detection
    risk_detected = len(risk_keywords) >= 2 or sentiment_score < -0.3
    
    # Urgency
    if risk_detected and sentiment_score < -0.5:
        urgency = "high"
    elif risk_detected:
        urgency = "medium"
    else:
        urgency = "low"
    
    # Generate summary (simplified - would use GPT-4 in production)
    word_count = len(data.transcription.split())
    summary = f"Call with {data.caller_type}. {word_count} words transcribed. "
    if risk_keywords:
        summary += f"Key topics: {', '.join(set(risk_keywords)[:3])}. "
    if sentiment_score > 0.3:
        summary += "Overall positive tone."
    elif sentiment_score < -0.3:
        summary += "Concerns expressed - follow-up recommended."
    else:
        summary += "Neutral discussion."
    
    # Action items (simplified)
    action_items = []
    if "change" in risk_keywords:
        action_items.append("Review and process change order request")
    if "delay" in risk_keywords:
        action_items.append("Update project schedule and communicate timeline")
    if sentiment_score < 0:
        action_items.append("Schedule follow-up call to address concerns")
    if not action_items:
        action_items.append("No immediate action required")
    
    return CallAnalysisResult(
        call_id=data.call_id,
        sentiment_score=round(sentiment_score, 2),
        risk_detected=risk_detected,
        risk_keywords=list(set(risk_keywords)),
        summary=summary,
        action_items=action_items,
        urgency=urgency
    )

@app.post("/api/v1/smart-estimate", response_model=EstimateResult)
async def generate_smart_estimate(data: EstimateInput):
    """Generate AI-powered cost estimate based on historical data"""
    
    # Base costs per square foot by project type and quality
    base_costs = {
        "custom_home": {"standard": 150, "premium": 225, "luxury": 350},
        "renovation": {"standard": 100, "premium": 150, "luxury": 250},
        "commercial": {"standard": 175, "premium": 250, "luxury": 400},
    }
    
    # Location multipliers (South Texas focused)
    location_multipliers = {
        "mcallen": 1.0, "harlingen": 0.95, "brownsville": 0.92,
        "mission": 1.02, "edinburg": 0.98, "pharr": 0.97,
        "south padre": 1.25, "default": 1.0
    }
    
    # Feature costs
    feature_costs = {
        "pool": 75000, "outdoor_kitchen": 35000, "smart_home": 25000,
        "solar": 30000, "generator": 15000, "elevator": 80000,
        "wine_cellar": 40000, "theater": 50000, "gym": 20000,
        "guest_house": 150000, "3_car_garage": 45000, "4_car_garage": 60000,
    }
    
    # Calculate base cost
    base_rate = base_costs.get(data.project_type, base_costs["custom_home"]).get(data.quality_level, 200)
    base_cost = data.square_footage * base_rate
    
    # Apply location multiplier
    location_key = data.location.lower().replace(" ", "_")
    multiplier = location_multipliers.get(location_key, location_multipliers["default"])
    adjusted_cost = base_cost * multiplier
    
    # Add feature costs
    features_cost = sum(feature_costs.get(f.lower().replace(" ", "_"), 0) for f in data.features)
    total_cost = adjusted_cost + features_cost
    
    # Calculate range (±10-15%)
    variance = 0.12 if data.quality_level == "luxury" else 0.10
    cost_low = total_cost * (1 - variance)
    cost_high = total_cost * (1 + variance)
    
    # Breakdown
    breakdown = {
        "base_construction": round(adjusted_cost * 0.45, 2),
        "labor": round(adjusted_cost * 0.35, 2),
        "materials": round(adjusted_cost * 0.20, 2),
        "features": round(features_cost, 2),
        "permits_fees": round(total_cost * 0.03, 2),
        "contingency": round(total_cost * 0.05, 2),
    }
    
    # Similar projects (mock data)
    similar_projects = [
        {"name": "Gonzalez Residence", "sqft": data.square_footage * 0.95, "cost": total_cost * 0.98, "variance": "+2%"},
        {"name": "Trevino Residence", "sqft": data.square_footage * 1.05, "cost": total_cost * 1.03, "variance": "-1%"},
    ]
    
    # Risk factors
    risk_factors = []
    if data.square_footage > 5000:
        risk_factors.append({"factor": "Large project size", "impact": "+5% contingency recommended"})
    if "pool" in [f.lower() for f in data.features]:
        risk_factors.append({"factor": "Pool construction", "impact": "Weather-dependent, allow extra time"})
    if data.quality_level == "luxury":
        risk_factors.append({"factor": "Luxury finishes", "impact": "Lead times may vary for specialty materials"})
    
    return EstimateResult(
        estimated_cost=round(total_cost, 2),
        confidence=0.85,
        cost_range_low=round(cost_low, 2),
        cost_range_high=round(cost_high, 2),
        breakdown=breakdown,
        similar_projects=similar_projects,
        risk_factors=risk_factors
    )

@app.get("/api/v1/risk-dashboard/{tenant_id}")
async def get_risk_dashboard(tenant_id: str):
    """Get aggregated risk metrics for dashboard"""
    
    # Mock data - would query database in production
    return {
        "tenant_id": tenant_id,
        "summary": {
            "total_projects": 54,
            "at_risk": 3,
            "critical": 1,
            "average_risk_score": 28.5
        },
        "top_risks": [
            {
                "project_id": "madeira-1",
                "project_name": "Madeira at Brownsville - Phase 1",
                "risk_score": 72,
                "risk_level": "high",
                "primary_factor": "Schedule delay - 12 days behind"
            },
            {
                "project_id": "trevino-1",
                "project_name": "Trevino Residence",
                "risk_score": 48,
                "risk_level": "medium",
                "primary_factor": "Subcontractor reliability issues"
            }
        ],
        "trends": {
            "risk_trend": "improving",
            "avg_risk_7d_ago": 32.1,
            "projects_resolved": 2
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)
