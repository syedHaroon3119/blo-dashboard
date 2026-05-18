import json
import random

initial_data = [
    {"sl_no": 1, "ps_no": 1, "aero": 1, "name": "A.Divya", "designation": "Jr inspector", "mobile": "8179934892", "percentage": 62.16},
    {"sl_no": 2, "ps_no": 2, "aero": 1, "name": "NIKESH KUMAR", "designation": "Sr Asst", "mobile": "9966891279", "percentage": 24.32},
    {"sl_no": 3, "ps_no": 3, "aero": 1, "name": "V ASHOK KUMAR", "designation": "Jr Asst", "mobile": "7702984714", "percentage": 33.64},
    {"sl_no": 4, "ps_no": 4, "aero": 1, "name": "E KIRAN KUMAR", "designation": "Sr.Asst", "mobile": "9346665210", "percentage": 24.6},
    {"sl_no": 5, "ps_no": 5, "aero": 1, "name": "A ROJA RANI", "designation": "Sr.Asst", "mobile": "9505369222", "percentage": 29.08},
    {"sl_no": 6, "ps_no": 6, "aero": 1, "name": "R SWAROOPA", "designation": "Sr.Asst", "mobile": "7674072539", "percentage": 33.26},
    {"sl_no": 7, "ps_no": 7, "aero": 1, "name": "S.BABAIAH", "designation": "SFA", "mobile": "9848092775", "percentage": 26.42},
    {"sl_no": 8, "ps_no": 8, "aero": 1, "name": "MD SHAOEB", "designation": "Jr Asst", "mobile": "8143445539", "percentage": 24.81},
    {"sl_no": 9, "ps_no": 9, "aero": 1, "name": "MD YOUSUF", "designation": "Jr Asst", "mobile": "9959402907", "percentage": 22.74},
    {"sl_no": 10, "ps_no": 10, "aero": 1, "name": "Anees Fathima", "designation": "Record Assistant", "mobile": "7794075598", "percentage": 29.33},
]

designations = ["Jr inspector", "Sr Asst", "Jr Asst", "SFA", "Record Assistant", "ATTENDER", "Office Subordinate", "KAMTEE", "Chowkidar", "Sanitary Jawan", "Bill Collector"]
first_names = ["Rahul", "Sonia", "Amit", "Pooja", "Vikram", "Sneha", "Ravi", "Anjali", "Suresh", "Kavita", "Ramesh", "Deepa", "Kiran", "Naveen", "Swati", "Mahesh", "Geeta", "Sunil", "Anita", "Prakash", "Syed", "Mohammad", "Abdul", "Fatima"]
last_names = ["Kumar", "Sharma", "Singh", "Reddy", "Rao", "Patil", "Desai", "Joshi", "Verma", "Yadav", "Ali", "Khan", "Begum", "Shaik"]

data = list(initial_data)

for i in range(11, 201):
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    designation = random.choice(designations)
    mobile = f"{random.randint(6000000000, 9999999999)}"
    percentage = round(random.uniform(10.0, 95.0), 2)
    aero = random.randint(1, 5)
    data.append({
        "sl_no": i,
        "ps_no": i,
        "aero": aero,
        "name": name,
        "designation": designation,
        "mobile": mobile,
        "percentage": percentage
    })

with open("src/data.json", "w") as f:
    json.dump(data, f, indent=2)

print("Generated src/data.json")
