from app.services.explain_ai import ExplainAI

ai = ExplainAI()
features = {"speed": 250.5, "throttle": 95.2, "brake": 0.0}
explanation = ai.explain_prediction(features, 95.234, "lap_time")
print(explanation)