import csv
import json


def read_csv(file_name):
    headers = []
    rows = []
    with open(file_name) as file_obj:
        read_obj = csv.reader(file_obj)
        for idx, row in enumerate(read_obj):
            if idx == 0:
                for idx_inner, category in enumerate(row):
                    if idx_inner != 0:
                        headers.append(category)
            else:
                rows.append(row)
    return headers, rows


def create_json(headers, rows):
    json_array = []
    for idx, row in enumerate(rows):
        question_string = ""
        answer_string = ""
        for idx_inner, info in enumerate(row):
            if idx_inner == 0:
                answer_string = info
            else:
                question_string += headers[idx_inner - 1] + ": "
                question_string += info
                if idx_inner < len(headers):
                    question_string += "\n"
        json_obj = {
            "question": question_string,
            "answer": answer_string
        }
        json_array.append(json_obj)
    return json_array


def main():
    file_name = "treaties"
    # print(f'Hi, {name}') # Press CTRL-F8 to toggle the breakpoint
    file_name_csv = file_name + ".csv"
    headers, rows = read_csv(file_name_csv)
    # print(create_json(headers, rows))
    json_array = create_json(headers, rows)
    json_object = json.dumps(json_array, indent=2)
    with open(file_name + ".json", "w") as out_file:
        out_file.write(json_object)


# Press the green button in the gutter to run the script
if __name__ == '__main__':
    main()
