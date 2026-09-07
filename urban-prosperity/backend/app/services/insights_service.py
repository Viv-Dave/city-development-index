from typing import Dict, List, Tuple
from app.config import settings
from app.schemas.cpi import CPIDimensions, IndicatorValues

def generate_urban_insights(
    city_name: str,
    dimensions: CPIDimensions,
    indicators: Dict[str, IndicatorValues]
) -> List[str]:
    """
    Dynamically generates analytic urban insights based on normalized dimension
    and indicator scores, identifying strengths, structural vulnerabilities, and positive drivers.
    """
    insights: List[str] = []

    # 1. Evaluate Dimension Strengths & Weaknesses
    dim_dict = {
        "Productivity": dimensions.productivity,
        "Infrastructure Development": dimensions.infrastructure,
        "Quality of Life": dimensions.quality_of_life,
        "Equity and Social Inclusion": dimensions.equity,
        "Environmental Sustainability": dimensions.environment,
        "Governance and Legislation": dimensions.governance,
    }

    sorted_dims = sorted(dim_dict.items(), key=lambda x: x[1], reverse=True)
    strongest_dim, strongest_score = sorted_dims[0]
    weakest_dim, weakest_score = sorted_dims[-1]

    if strongest_score >= 70.0:
        insights.append(f"{strongest_dim} is {city_name}'s foremost competitive strength with an index score of {strongest_score:.1f}/100.")
    else:
        insights.append(f"{strongest_dim} leads the city's sectoral profile with a moderate score of {strongest_score:.1f}/100.")

    if weakest_score < 45.0:
        insights.append(f"{weakest_dim} represents a critical structural constraint for {city_name}, lagging at {weakest_score:.1f}/100.")
    else:
        insights.append(f"{weakest_dim} is the lowest-performing dimension at {weakest_score:.1f}/100, indicating a targeted area for capital expenditure.")

    # 2. Evaluate Specific Indicator Drivers
    if indicators:
        # Sort by normalized value
        sorted_inds = sorted(indicators.values(), key=lambda ind: ind.normalized, reverse=True)
        top_positive = sorted_inds[0]
        top_negative = sorted_inds[-1]

        insights.append(
            f"{top_positive.display_name} ({top_positive.raw} {top_positive.unit or ''}) is a primary positive driver, scoring {top_positive.normalized:.1f}/100."
        )

        if top_negative.direction == "negative":
            insights.append(
                f"{top_negative.display_name} ({top_negative.raw} {top_negative.unit or ''}) exerts significant drag on urban prosperity due to high adverse intensity."
            )
        else:
            insights.append(
                f"{top_negative.display_name} ({top_negative.raw} {top_negative.unit or ''}) demonstrates low coverage or deficit ({top_negative.normalized:.1f}/100), constraining service parity."
            )

    # 3. Targeted Environmental & Infrastructure Checks
    if "pm25" in indicators:
        pm25 = indicators["pm25"]
        if pm25.raw > 4.5:
            insights.append(
                f"Air pollution levels (PM2.5: {pm25.raw} µg/m³) require urgent emission control and micro-climate vegetative buffers."
            )
        elif pm25.raw < 3.2:
            insights.append(
                f"Ambient air quality (PM2.5: {pm25.raw} µg/m³) demonstrates superior atmospheric dispersion compared to national cohort medians."
            )

    if "road_quality_score" in indicators and "public_transport_score" in indicators:
        road = indicators["road_quality_score"]
        transit = indicators["public_transport_score"]
        if road.normalized > transit.normalized + 20:
            insights.append("Pavement infrastructure substantially outpaces mass transit coverage, suggesting a car-centric infrastructure bias.")
        elif transit.normalized > road.normalized + 10:
            insights.append("Public transit accessibility outperforms arterial road quality, fostering high-capacity modal transit share.")

    return insights
