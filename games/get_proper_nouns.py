clues = ["Scientists now believe a species of this flying mammal buzzes like a wasp to deter owls from eating them",
         "Briana Scurry, Megan Rapinoe",
         "In Proverbs 5 ""her end is bitter as wormwood, sharp as a two-edged"" this",
         "This 102-story structure on New York City's 34th Street is kinda hard to miss",
         "\"\"It's a poor craftsman\"\" who does this; how's a hammer going to respond anyway?"]

answers = ["a bat", "soccer", "sword"]


def get_proper_nouns():
    freq_dict = {}
    for clue in clues:
        words = clue.split(" ")
        cur_phrase = ""
        for idx, word in enumerate(words):
            # First word will always be capitalized, be skeptical
            if idx == 0:
                if words[1][0].isupper():
                    cur_phrase += word
            else:
                # Proper noun (or part of one)
                if word[0].isupper():
                    # Check if we're already building one
                    if len(cur_phrase) > 0:
                        cur_phrase += " " + word
                    else:
                        cur_phrase += word
                else:
                    # Check if we have a word to add to our freq dict
                    if len(cur_phrase) > 0:
                        if cur_phrase in freq_dict:
                            freq_dict[cur_phrase] += 1
                        else:
                            freq_dict[cur_phrase] = 1
            if idx == len(clue) - 1 and len(cur_phrase) > 0:
                if cur_phrase in freq_dict:
                    freq_dict[cur_phrase] += 1
                else:
                    freq_dict[cur_phrase] = 1
    return freq_dict


def main():
    print(get_proper_nouns())


if __name__ == '__main__':
    main()
