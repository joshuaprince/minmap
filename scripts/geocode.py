import csv
from time import sleep

from geopy.geocoders import Nominatim

"""
Script to digest a CSV file formatted with casino names and locations and attempt to convert as many as possible to
raw coordinates to be saved in the spreadsheet.

Usage: python geocode.py
       Change FILE below to specify the path to the CSV file containing casino data.
       Input file is untouched and output file is saved as FILE.out.csv
"""

FILE = "./geocode-data/coords"  # .csv, .out.csv
SLEEP_SECONDS = 2


def main():
    geolocator = Nominatim(user_agent="minmap")

    with open(f"{FILE}.csv", newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    try:
        for row in rows:
            if "casino".casefold() in row["Casino"].casefold():
                lookup = row["Casino"] + ", " + row["City"] + ", " + row["State"]
            else:
                lookup = row["Casino"] + " Casino, " + row["City"] + ", " + row["State"]

            sleep_time = SLEEP_SECONDS
            while True:
                try:
                    location = geolocator.geocode(lookup, timeout=10)
                    break
                except Exception as e:
                    print(f"Geocoding error for {lookup}: {e}")
                    sleep_time += 1
                    sleep(sleep_time)

            if location is None:
                coords = "Error"
            else:
                coords = "{:.4f},{:.4f}".format(location.latitude, location.longitude)

            print(lookup)
            print(" -> " + str(location) + " (" + coords + ")")
            print("")

            row["Resolved"] = location
            row["Coords"] = coords
            sleep(SLEEP_SECONDS)
    except KeyboardInterrupt:
        print("Interrupted by user.")

    with open(f"{FILE}.out.csv", "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=reader.fieldnames + ["Resolved", "Coords"])
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
