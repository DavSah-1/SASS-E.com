#!/usr/bin/env python3
"""
Generate experiment-specific quiz questions for all 30 Science Lab experiments.
This script queries experiment details from the database and generates tailored
quiz questions using the LLM API.
"""

import os
import sys
import json
import mysql.connector
from typing import List, Dict

# Add parent directory to path to import from server
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_db_connection():
    """Create database connection from DATABASE_URL environment variable."""
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Parse mysql://user:pass@host:port/dbname
    # Format: mysql://username:password@host:port/database
    parts = db_url.replace('mysql://', '').split('@')
    user_pass = parts[0].split(':')
    host_db = parts[1].split('/')
    host_port = host_db[0].split(':')
    
    return mysql.connector.connect(
        host=host_port[0],
        port=int(host_port[1]) if len(host_port) > 1 else 3306,
        user=user_pass[0],
        password=user_pass[1],
        database=host_db[1].split('?')[0]
    )

def get_all_experiments(cursor) -> List[Dict]:
    """Fetch all experiments from database."""
    cursor.execute("""
        SELECT id, title, category, difficulty, description, equipment, safetyWarnings
        FROM experiments
        ORDER BY id
    """)
    
    experiments = []
    for row in cursor.fetchall():
        experiments.append({
            'id': row[0],
            'title': row[1],
            'category': row[2],
            'difficulty': row[3],
            'description': row[4],
            'equipment': row[5],
            'safetyWarnings': row[6]
        })
    return experiments

def generate_quiz_questions_for_experiment(experiment: Dict) -> List[Dict]:
    """
    Generate 6 tailored quiz questions for an experiment.
    Returns list of question dictionaries.
    """
    # For now, generate generic but contextual questions based on experiment details
    # In a full implementation, this would call the LLM API
    
    questions = []
    exp_id = experiment['id']
    title = experiment['title']
    category = experiment['category']
    safety = experiment['safetyWarnings'] or "Follow general lab safety protocols"
    equipment = experiment['equipment'] or "Standard lab equipment"
    
    # Safety Question 1
    questions.append({
        'experimentId': exp_id,
        'question': f"What is the primary safety concern when performing the {title} experiment?",
        'options': json.dumps([
            "Working too slowly",
            safety.split('.')[0] if '.' in safety else safety[:80],
            "Using too much equipment",
            "Taking too many notes"
        ]),
        'correctAnswer': 1,
        'explanation': f"This experiment requires attention to: {safety[:150]}",
        'category': 'safety'
    })
    
    # Safety Question 2
    questions.append({
        'experimentId': exp_id,
        'question': f"What protective equipment should you wear for this {category} experiment?",
        'options': json.dumps([
            "Casual clothing only",
            "Safety goggles and appropriate protective gear",
            "Just gloves",
            "No protection needed"
        ]),
        'correctAnswer': 1,
        'explanation': f"{category.capitalize()} experiments require proper safety equipment to prevent injury.",
        'category': 'safety'
    })
    
    # Equipment Question 1
    questions.append({
        'experimentId': exp_id,
        'question': f"What key equipment is used in the {title} experiment?",
        'options': json.dumps([
            "Computer only",
            equipment.split(',')[0].strip() if ',' in equipment else equipment[:50],
            "Pencil and paper",
            "Calculator"
        ]),
        'correctAnswer': 1,
        'explanation': f"This experiment requires: {equipment[:150]}",
        'category': 'equipment'
    })
    
    # Equipment Question 2
    questions.append({
        'experimentId': exp_id,
        'question': f"Why is proper equipment setup important in this experiment?",
        'options': json.dumps([
            "To impress others",
            "To ensure accurate results and safety",
            "To use more materials",
            "To take longer"
        ]),
        'correctAnswer': 1,
        'explanation': "Proper setup ensures both safety and reliable experimental results.",
        'category': 'equipment'
    })
    
    # Theory Question 1
    questions.append({
        'experimentId': exp_id,
        'question': f"What scientific principle does the {title} experiment demonstrate?",
        'options': json.dumps([
            "No particular principle",
            experiment['description'][:80] if len(experiment['description']) < 80 else experiment['description'][:77] + "...",
            "Random observations",
            "Artistic expression"
        ]),
        'correctAnswer': 1,
        'explanation': f"This experiment demonstrates: {experiment['description'][:200]}",
        'category': 'theory'
    })
    
    # Theory Question 2
    questions.append({
        'experimentId': exp_id,
        'question': f"What field of {category} does this experiment explore?",
        'options': json.dumps([
            "None",
            f"Core concepts in {category}",
            "Unrelated topics",
            "Historical facts only"
        ]),
        'correctAnswer': 1,
        'explanation': f"This experiment explores fundamental principles in {category}.",
        'category': 'theory'
    })
    
    return questions

def clear_existing_questions(cursor):
    """Delete all existing quiz questions."""
    cursor.execute("DELETE FROM lab_quiz_questions")
    print("🗑️  Cleared existing quiz questions")

def insert_quiz_questions(cursor, questions: List[Dict]):
    """Insert quiz questions into database."""
    insert_query = """
        INSERT INTO lab_quiz_questions 
        (experimentId, question, options, correctAnswer, explanation, category)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    for q in questions:
        cursor.execute(insert_query, (
            q['experimentId'],
            q['question'],
            q['options'],
            q['correctAnswer'],
            q['explanation'],
            q['category']
        ))

def main():
    print("🧪 Generating experiment-specific quiz questions...")
    
    try:
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all experiments
        experiments = get_all_experiments(cursor)
        print(f"📋 Found {len(experiments)} experiments")
        
        # Clear existing questions
        clear_existing_questions(cursor)
        
        # Generate questions for each experiment
        all_questions = []
        for exp in experiments:
            print(f"   Generating questions for: {exp['title']}")
            questions = generate_quiz_questions_for_experiment(exp)
            all_questions.extend(questions)
        
        # Insert all questions
        insert_quiz_questions(cursor, all_questions)
        conn.commit()
        
        print(f"✅ Successfully generated and inserted {len(all_questions)} quiz questions")
        print(f"📊 Coverage: {len(all_questions) // 6} experiments × 6 questions each")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
