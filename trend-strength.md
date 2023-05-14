# Trending Strength Of A Stock

Measuring the trend of a stock is possible in a million ways, probably. For this trending strength measure there are conditions. "TS" is short for the trending strength measure

The trending strength's boundary conditions:

1. TS is a number between 100 and -100
2. The True Strength Index contributes to TS
3. The Volume should be part of calculating TS, too.
4. By how much tsi(13) is above (green) or below (red) tsi(25)

The components of the trending strength (TS) should be stored as single values, because each component on its own can be displayed in a web-based user-interface, which supports sorting and filtering by each single component.


## True Strength Index based Calculations

### 2. The True Strength Index contributes to TS

Two lines of the True Strength Index are fundamental:
- tsi(13) based on the last 13 trading days
- tsi(25) based on the last 25 trading days
- comp(tsi) is a component of TS which is based on the True Strength Index

comp(tsi) = (( tsi(13) - tsi(25) ) / tsi(25) ) + tsi(13) + tsi(25) * 100

### 3. By how much tsi(13) is above (green) or below (red) tsi(25)

This measure should be listed as a separate information

measure = ( tsi(13) / tsi(25) - 1 ) * 100