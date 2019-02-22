Burp
====

.. code::

  an OpenAir command-line client
      but *more accurately*...

  an OpenAir domain-specific language that
    includes a Swiss-army knife collection of
      lenses,
      traversals,
      & prisms
    for all your matrix getting and setting needs

  ~ written with Flow and Babel ~

Diary
=====

**Day 2** added a REPL with dumb lexing. We now have ``focus`` and ``list``.

- Switched to inquirer after Dennis recommended it on Slack.
- Nightmare.js code broken out into a ``robots`` module.
- People seem excited to burp™.

.. code::

  ? $ list
  auth: logging in
  auth: logged in

    ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐
    │    Start Date     │       Name        │       User        │       Hours       │
    ├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
    │    01/29/2018     │   01/29/2018 to   │     Lian, Hao     │         0         │
    │                   │   02/04/2018 -    │                   │                   │
    │                   │      January      │                   │                   │
    ├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
    │    01/29/2018     │   01/29/2018 to   │     Lian, Hao     │         0         │
    │                   │   02/04/2018 -    │                   │                   │
    │                   │     February      │                   │                   │
    ├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
    │    01/22/2018     │   01/22/2018 to   │     Lian, Hao     │        40         │
    │                   │    01/28/2018     │                   │                   │
    └───────────────────┴───────────────────┴───────────────────┴───────────────────┘

  ? $ focus /22/
  auth: logging in
  auth: logged in

    ┌─────────────────────────────┬───────────────────┬───────────────────┬───────────────────┬───────────────────┐
    │           Partner           │     Sentiment     │       Task        │       Hours       │       Total       │
    ├─────────────────────────────┼───────────────────┼───────────────────┼───────────────────┼───────────────────┤
    │  XXXXXXXXX : SOW #4 XXXXXX  │       Happy       │  13: Engineering  │   8,8,8,8,8,0,0   │        40         │
    │        XXXXXXXX MVP         │                   │      [Alpha]      │                   │                   │
    └─────────────────────────────┴───────────────────┴───────────────────┴───────────────────┴───────────────────┘
