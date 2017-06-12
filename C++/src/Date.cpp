// Copyright 2017 zhenly
#include "Date.hpp"
#include <cstring>
#include <sstream>
#include <iomanip>
#include <iostream>
#include <string>

using std::string;

Date::Date() {
  m_year = 0;
  m_month = 0;
  m_day = 0;
  m_hour = 0;
  m_minute = 0;
}

/**
* @brief constructor with arguments
*/
Date::Date(int t_year, int t_month, int t_day, int t_hour, int t_minute) {
  m_year = t_year;
  m_month = t_month;
  m_day = t_day;
  m_hour = t_hour;
  m_minute = t_minute;
}

/**
* @brief constructor with a string
*/
Date::Date(const std::string &dateString) {
  *this = Date::stringToDate(dateString);
}
/**
* @brief return the year of a Date
* @return a integer indicate the year of a date
*/
int Date::getYear(void) const {return m_year;}

/**
* @brief set the year of a date
* @param a integer indicate the new year of a date
*/
void Date::setYear(const int t_year) {m_year = t_year;}

/**
* @brief return the month of a Date
* @return a integer indicate the month of a date
*/
int Date::getMonth(void) const {return m_month;}

/**
* @brief set the month of a date
* @param a integer indicate the new month of a date
*/
void Date::setMonth(const int t_month) {m_month = t_month;}

/**
* @brief return the day of a Date
* @return a integer indicate the day of a date
*/
int Date::getDay(void) const {return m_day;}

/**
* @brief set the day of a date
* @param a integer indicate the new day of a date
*/
void Date::setDay(const int t_day) {m_day = t_day;}

/**
* @brief return the hour of a Date
* @return a integer indicate the hour of a date
*/
int Date::getHour(void) const {return m_hour;}

/**
* @brief set the hour of a date
* @param a integer indicate the new hour of a date
*/
void Date::setHour(const int t_hour) {m_hour = t_hour;}

/**
* @brief return the minute of a Date
* @return a integer indicate the minute of a date
*/
int Date::getMinute(void) const {return m_minute;}

/**
* @brief set the minute of a date
* @param a integer indicate the new minute of a date
*/
void Date::setMinute(const int t_minute) {m_minute = t_minute;}

/**
* @brief check whether the date is valid or not
* @return the bool indicate valid or not
*/
bool Date::isValid(const Date &t_date) {
  if (t_date.m_year < 1000 || t_date.m_year > 9999 ||
    t_date.m_month < 1 || t_date.m_month > 12 ||
    t_date.m_day < 1 || t_date.m_day > 31 ||
    t_date.m_hour < 0 || t_date.m_hour > 23 ||
    t_date.m_minute < 0 || t_date.m_minute > 59) return false;
  int day_two = 28;
  if (((t_date.m_year % 4 == 0 && t_date.m_year % 100 != 0 )||
    t_date.m_year % 400 == 0)) {
    day_two = 29;
  }
  switch (t_date.m_month) {
    case 2:
      if (t_date.m_day > day_two) return false;
      break;
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      if (t_date.m_day > 31) return false;
      break;
    default:
      if (t_date.m_day > 30) return false;
      break;
  }
  return true;
}
// static

/**
* @brief convert a string to date, if the format is not correct return
* 0000-00-00/00:00
* @return a date
*/

bool isNotNum(string num, int lenght) {
  for (int i = 0; i < lenght; ++i) {
    if (num[i] < '0' || num[i] > '9') {
      return true;
    }
  }
  return false;
}
Date Date::stringToDate(const std::string &t_dateString) {
  Date temp;
  if (t_dateString.length() != 16) return temp;
  if (isNotNum(t_dateString.substr(0, 4), 4)||
    t_dateString[4] != '-' ||
     isNotNum(t_dateString.substr(5, 2), 2)||
    t_dateString[7] != '-' ||
     isNotNum(t_dateString.substr(8, 2), 2)||
    t_dateString[10] != '/' ||
     isNotNum(t_dateString.substr(11, 2), 2)||
    t_dateString[13] != ':' ||
     isNotNum(t_dateString.substr(14, 2), 2)) {
    return temp;
  }
  temp.setYear(
    (t_dateString[0] - '0')*1000 +
    (t_dateString[1] - '0')*100 +
    (t_dateString[2] - '0')*10 +
    (t_dateString[3] - '0'));
  temp.setMonth(
    (t_dateString[5] - '0')*10 +
    (t_dateString[6] - '0'));
  temp.setDay(
    (t_dateString[8] - '0')*10 +
    (t_dateString[9] - '0'));
  temp.setHour(
    (t_dateString[11] - '0')*10 +
    (t_dateString[12] - '0'));
  temp.setMinute(
    (t_dateString[14] - '0')*10 +
    (t_dateString[15] - '0'));
  // if(!Date::isValid(temp)) return Date();
  return temp;
}
// static

/**
* @brief convert a date to string, if the format is not correct return
* 0000-00-00/00:00
*/
std::string Date::dateToString(const Date &t_date) {
  std::stringstream ss;
  if (isValid(t_date)) {
    ss << t_date.m_year << "-" <<
    (t_date.m_month < 10 ? "0" : "") << t_date.m_month << "-" <<
    (t_date.m_day < 10 ? "0" : "") << t_date.m_day << "/" <<
    (t_date.m_hour < 10 ? "0" : "") << t_date.m_hour << ":" <<
    (t_date.m_minute < 10 ? "0" : "") << t_date.m_minute;
  } else {
    ss << "0000-00-00/00:00";
  }
  return ss.str();
}
// static

/**
*@brief overload the assign operator
*/
Date &Date::operator=(const Date &t_date) {
  m_year = t_date.m_year;
  m_month = t_date.m_month;
  m_day = t_date.m_day;
  m_hour = t_date.m_hour;
  m_minute = t_date.m_minute;
  return *this;
}

/**
* @brief check whether the CurrentDate is equal to the t_date
*/
bool Date::operator==(const Date &t_date) const {
  if (m_year == t_date.m_year && m_month == t_date.m_month &&
    m_day == t_date.m_day && m_hour == t_date.m_hour &&
    m_minute == t_date.m_minute) {
    return true;
  }
  return false;
}

/**
* @brief check whether the CurrentDate isgreater than the t_date
*/
bool Date::operator>(const Date &t_date) const {
  if (m_year > t_date.m_year) return true;
  if (m_year < t_date.m_year) return false;
  if (m_month > t_date.m_month) return true;
  if (m_month < t_date.m_month) return false;
  if (m_day > t_date.m_day) return true;
  if (m_day < t_date.m_day) return false;
  if (m_hour > t_date.m_hour) return true;
  if (m_hour < t_date.m_hour) return false;
  if (m_minute > t_date.m_minute) return true;
  return false;
}

/**
* @brief check whether the CurrentDate isless than the t_date
*/
bool Date::operator<(const Date &t_date) const {
  if (m_year < t_date.m_year) return true;
  if (m_year > t_date.m_year) return false;
  if (m_month < t_date.m_month) return true;
  if (m_month > t_date.m_month) return false;
  if (m_day < t_date.m_day) return true;
  if (m_day > t_date.m_day) return false;
  if (m_hour < t_date.m_hour) return true;
  if (m_hour > t_date.m_hour) return false;
  if (m_minute < t_date.m_minute) return true;
  return false;
}

/**
* @brief check whether the CurrentDate isgreater or equal than the t_date
*/
bool Date::operator>=(const Date &t_date) const {
  return (*this > t_date || *this == t_date);
}

/**
* @brief check whether the CurrentDate isless than or equal to the t_date
*/
bool Date::operator<=(const Date &t_date) const {
  return (*this < t_date || *this == t_date);
}








