import os 

def files_extractor(root_dir, extensions=None):
    all_files = []
    for root, _, files in os.walk(root_dir):
        for file in files:
            if extensions is None or file.lower().endswith(tuple(extensions)):
                # gets the full file path name
                all_files.append(os.path.join(root, file))
    return all_files

# only user file paths
home_dir = os.path.expanduser("~")
file_extensions = ['.pdf', '.md', '.txt', '.docx', '.html']
files = files_extractor(home_dir, file_extensions)
