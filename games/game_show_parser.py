#!/usr/bin/python3

from bs4 import BeautifulSoup as soup
from urllib.request import urlopen as u_req
import pprint
import json
import sys
import math

# Initialize pretty printer
pp = pprint.PrettyPrinter(indent=4)


# Return clue objects for each clue in the inputted game
def get_clues_per_game(game_number):
    print(game_number)
    # JSON to return
    game_JSON = {}
    game_JSON["categories_sj"] = []
    game_JSON["categories_dj"] = []
    game_JSON["categories_fj"] = []
    game_JSON["clues_sj"] = {}
    game_JSON["clues_dj"] = {}
    game_JSON["clues_fj"] = {}

    # J! Archive URL
    url = "http://j-archive.com/showgame.php?game_id=" + str(game_number)

    # Open connection
    u_client = u_req(url)

    # Get source html and parse with soup
    page_html = u_client.read()
    u_client.close()
    page_soup = soup(page_html, "html.parser")

    # Get map of jeopardy round to category list
    categories = page_soup.findAll("td", {"class": "category_name"})
    categories_list = [cat.getText() for cat in categories]

    category_counter = 0
    while category_counter < 13:
        category_counter_str = str(category_counter % 6)
        cateogory_to_append = {}
        cateogory_to_append["title"] = categories_list[category_counter]
        cateogory_to_append["clues"] = [category_counter_str + "-0", category_counter_str + "-1",
            category_counter_str + "-2", category_counter_str + "-3", category_counter_str + "-4"]
        if category_counter < 6:
            game_JSON["categories_sj"].append(cateogory_to_append)
        elif category_counter < 12:
            game_JSON["categories_dj"].append(cateogory_to_append)
        else:
            cateogory_to_append["clues"] = ["0-0"]
            game_JSON["categories_fj"].append(cateogory_to_append)
        category_counter += 1

    # Get clue attrs
    clues = page_soup.findAll("td", {"class": "clue"})

    # Extract text, id, value, and answer from the clue
    clue_questions = [clue.findAll("td", {"class": "clue_text"})[0].getText() for clue in clues if clue.div is not None]
    clue_ids = [clue.div.findAll("td", {"class": "clue_unstuck"})[0]['id'] for clue in clues
        if clue.div is not None and len(clue.div.findAll("td", {"class": "clue_unstuck"})) > 0]
    clue_answers = [clue.div['onmouseover'].split("correct_response\">")[1].split("</em>")[0] for clue in clues
        if clue.div is not None]

    clean_clue_answers = []
    for answer in clue_answers:
        clean_answer = answer.replace("<i>", "").replace("</i>", "").replace("\\", "")
        clean_clue_answers.append(clean_answer)

    # Exclude clues that they didn't get to during the game
    all_clue_ids = ['clue_J_1_1_stuck', 'clue_J_2_1_stuck', 'clue_J_3_1_stuck', 'clue_J_4_1_stuck',
        'clue_J_5_1_stuck', 'clue_J_6_1_stuck', 'clue_J_1_2_stuck', 'clue_J_2_2_stuck', 'clue_J_3_2_stuck',
        'clue_J_4_2_stuck', 'clue_J_5_2_stuck', 'clue_J_6_2_stuck', 'clue_J_1_3_stuck', 'clue_J_2_3_stuck',
        'clue_J_3_3_stuck', 'clue_J_4_3_stuck', 'clue_J_5_3_stuck', 'clue_J_6_3_stuck', 'clue_J_1_4_stuck',
        'clue_J_2_4_stuck', 'clue_J_3_4_stuck', 'clue_J_4_4_stuck', 'clue_J_5_4_stuck', 'clue_J_6_4_stuck',
        'clue_J_1_5_stuck', 'clue_J_2_5_stuck', 'clue_J_3_5_stuck', 'clue_J_4_5_stuck', 'clue_J_5_5_stuck',
        'clue_J_6_5_stuck', 'clue_DJ_1_1_stuck', 'clue_DJ_2_1_stuck', 'clue_DJ_3_1_stuck', 'clue_DJ_4_1_stuck',
        'clue_DJ_5_1_stuck', 'clue_DJ_6_1_stuck', 'clue_DJ_1_2_stuck', 'clue_DJ_2_2_stuck', 'clue_DJ_3_2_stuck',
        'clue_DJ_4_2_stuck', 'clue_DJ_5_2_stuck', 'clue_DJ_6_2_stuck', 'clue_DJ_1_3_stuck', 'clue_DJ_2_3_stuck',
        'clue_DJ_3_3_stuck', 'clue_DJ_4_3_stuck', 'clue_DJ_5_3_stuck', 'clue_DJ_6_3_stuck', 'clue_DJ_1_4_stuck',
        'clue_DJ_2_4_stuck', 'clue_DJ_3_4_stuck', 'clue_DJ_4_4_stuck', 'clue_DJ_5_4_stuck', 'clue_DJ_6_4_stuck',
        'clue_DJ_1_5_stuck', 'clue_DJ_2_5_stuck', 'clue_DJ_3_5_stuck', 'clue_DJ_4_5_stuck', 'clue_DJ_5_5_stuck',
        'clue_DJ_6_5_stuck']
    excluded_clues = list(set(all_clue_ids).difference(clue_ids))
    for ex_clue in excluded_clues:
        all_clue_ids[all_clue_ids.index(ex_clue)] = "unused"

    # Add clues to JSON
    for i in range(len(clue_ids)):
        row_str = str((i % 6))
        if i < 30:
            col_str = str(math.floor(i / 6))
            add_clue_sj = {}
            if all_clue_ids[i] == "unused":
                add_clue_sj["question"] = "Unused question"
                add_clue_sj["answer"] = "Unused answer"
            else:
                add_clue_sj["question"] = clue_questions[i]
                add_clue_sj["answer"] = clean_clue_answers[i]
            add_clue_sj["value"] = (math.floor(i / 6) + 1) * 200
            add_clue_sj["is_dd"] = False
            game_JSON["clues_sj"][row_str + "-" + col_str] = add_clue_sj
        else:
            col_str = str((math.floor(i / 6) - 5))
            add_clue_dj = {}
            if all_clue_ids[i] == "unused":
                add_clue_dj["question"] = "Unused question"
                add_clue_dj["answer"] = "Unused answer"
            else:
                add_clue_dj["question"] = clue_questions[i]
                add_clue_dj["answer"] = clean_clue_answers[i]
            add_clue_dj["value"] = (math.floor((i - 30) / 6) + 1) * 400
            add_clue_dj["is_dd"] = False
            game_JSON["clues_dj"][row_str + "-" + col_str] = add_clue_dj

    # Handle final jeopardy separately
    final_jeopardy = page_soup.findAll("table", {"class": "final_round"})[0]
    add_clue_fj = {}
    add_clue_fj["question"] = page_soup.findAll("td", {"id": "clue_FJ"})[0].getText()
    add_clue_fj["answer"] = final_jeopardy.div['onmouseover'].split("correct_response")[1].split("</em>")[0][3:]
    add_clue_fj["value"] = 10000
    add_clue_fj["is_dd"] = False
    game_JSON["clues_fj"]["0-0"] = add_clue_fj

    # pp.pprint(game_JSON)
    return game_JSON


def write_to_file(game_number, json_data):
    game_number_str= str(game_number)
    file_name = game_number_str + ".json"
    with open(file_name, "w") as output_file:
        json.dump(json_data, output_file)


def main():
    if len(sys.argv) != 3 and len(sys.argv) != 2:
        # print("Usage: ./game_show_parser required: <first game number> optional: <last game number>")
        print("Usage: ./game_show_parser required: <first game date> optional: <last game date>")
        return

    # Get clues for each game
    # cur_game_number = int(sys.argv[1])
    # if len(sys.argv) == 3:
        # max_game_number = int(sys.argv[2])
    # else:
        # max_game_number = cur_game_number

    # Get JSON games and write them to files
    # while cur_game_number <= max_game_number:
        # json_data = get_clues_per_game(cur_game_number)
        # write_to_file(cur_game_number, json_data)
        # cur_game_number += 1

    # Get date to game_id mapping
    file = open("date_to_game_id.json")
    date_to_game_id = json.load(file)
    first_game_number = int(date_to_game_id[sys.argv[1]])
    if len(sys.argv) == 3:
        last_game_number = int(date_to_game_id[sys.argv[2]])
    else:
        last_game_number = first_game_number

    # Get JSON games and write them to files
    for date, game_id in date_to_game_id.items():
        if first_game_number <= int(game_id) <= last_game_number:
            json_data = get_clues_per_game(int(game_id))
            write_to_file(int(game_id), json_data)


if __name__ == "__main__":
    main()
