CREATE TABLE IF NOT EXISTS albums(id TEXT PRIMARY KEY, artistid TEXT, artistname TEXT, name TEXT, totalplays bigint, releasedate text, image TEXT, lastupdated timestamp);
CREATE TABLE IF NOT EXISTS artists(id TEXT PRIMARY KEY, name TEXT, monthlyplays bigint, totalplays bigint, chartposition smallint, lastupdated timestamp, image TEXT);
CREATE TABLE IF NOT EXISTS songs(id TEXT PRIMARY KEY, artistid TEXT, artistname TEXT, name TEXT, totalplays bigint, image TEXT, lastupdated timestamp);
CREATE TABLE IF NOT EXISTS scrapedartists(id TEXT PRIMARY KEY, indexed bool);
CREATE TABLE IF NOT EXISTS scrapedalbums(id TEXT PRIMARY KEY, indexed bool);
CREATE TABLE IF NOT EXISTS scrapedsongs(id TEXT PRIMARY KEY, indexed bool);