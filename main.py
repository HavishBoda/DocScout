import sys

user_input = input("Enter (i) indexing, (q) querying or (e) exit: ")
while user_input not in ["i", "q", "e"]:
    user_input = input("Invalid choice, enter either (i), (q), or (e): ")

if user_input == "i":
    print("hi")
elif user_input == "q":
    print("goodbye")
elif user_input == "e":
    sys.exit(0)