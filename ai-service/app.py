from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "AI CV Filtering service is running!"})

@app.route('/match', methods=['POST'])
def match_cv():
    data = request.get_json()

    cv_text = data.get('cvText', '')
    required_skills = data.get('requiredSkills', [])

    if not cv_text or not required_skills:
        return jsonify({"error": "Missing cvText or requiredSkills"}), 400

    cv_text_lower = cv_text.lower()

    matched_skills = []
    missing_skills = []

    # Words that often appear right before a skill to negate it
    negation_words = ['not', 'no', "don't", "didn't", 'never', 'without', 'lack', 'lacking']

    for skill in required_skills:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        match = re.search(pattern, cv_text_lower)

        if match:
            # Check the few words right before the skill for negation
            preceding_text = cv_text_lower[:match.start()]
            preceding_words = preceding_text.split()[-4:]  # look at last 4 words before the skill
            

            is_negated = any(neg in preceding_words for neg in negation_words)

            if is_negated:
                missing_skills.append(skill)
            else:
                matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    match_percentage = round((len(matched_skills) / len(required_skills)) * 100)

    return jsonify({
        "matchPercentage": match_percentage,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)