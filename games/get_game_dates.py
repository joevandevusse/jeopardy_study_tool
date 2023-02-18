#!/usr/bin/python3

from bs4 import BeautifulSoup as soup
from urllib.request import urlopen as u_req
import pprint
import json

# Initialize pretty printer
pp = pprint.PrettyPrinter(indent=4)


def main():
    # Let's try it all in one request
    date_to_game_json = {}
    season = 38
    # Season 37: 8236 - 6821 = 1415
    # Season 38: 
    differential = 8236 - 6821

    url = "https://www.j-archive.com/showseason.php?season=" + str(season)
    u_client = u_req(url)
    page_html = u_client.read()
    u_client.close()
    page_soup = soup(page_html, "html.parser")
    links = page_soup.findAll("td")
    for link in links:
        link_str = link.getText()
        tokens = link_str.split()
        if len(tokens) == 3 and tokens[0][0] == '#':
            game_num = tokens[0][1:5]
            date = tokens[2]
            date_to_game_json[date] = int(game_num) - differential
    file_name = "date_to_game_id_s38.json"
    with open(file_name, "w") as output_file:
        json.dump(date_to_game_json, output_file)


if __name__ == "__main__":
    main()
