// Copyright 2017 zhenly
#include "Storage.hpp"
#include <fstream>
#include <string>
#include <iostream>
#include <memory>
#include <list>
#include <vector>
#include "Path.hpp"

using std::fstream;
using std::string;
using std::cout;
using std::endl;
using std::size_t;
std::shared_ptr<Storage> Storage::m_instance = nullptr;
/**
* default constructor
*/
Storage::Storage() {
  m_dirty = false;
  readFromFile();
}

/**
* read file content into memory
* @return if success, true will be returned
*/
bool Storage::readFromFile(void) {
  std::ifstream fs;
  string value;
  fs.open(Path::meetingPath, std::ios::in);
  if (!fs.is_open()) return false;
  m_meetingList.clear();
  while (!fs.eof()) {
    getline(fs, value);
    if(!value.size()) continue;
    size_t foundOne =  0, foundTwo = -1;
    string arrString[5];
    for (int i = 0; i < 5; ++i) {
      foundOne =  value.find('\"', foundTwo + 1);
      foundTwo = value.find('\"', foundOne + 1);
      arrString[i] = value.substr(foundOne + 1, foundTwo - foundOne - 1);
    }
    size_t found = 0, founds = 0;
    string temp;
    std::vector<string> m_participators;
    while ((founds = arrString[1].find('&', found)) != std::string::npos) {
      temp = arrString[1].substr(found, founds - found);
      found = founds + 1;
      m_participators.push_back(temp);
    }
    temp = arrString[1].substr(found, founds - found);
    m_participators.push_back(temp);

    m_meetingList.push_back(Meeting(
      arrString[0], m_participators, Date(arrString[2]), Date(arrString[3]), arrString[4]));
  }
  fs.close();

  fs.open(Path::userPath, std::ios::in);
  if (!fs.is_open()) return false;
  m_userList.clear();
  while (!fs.eof()) {
    getline(fs, value);
    if(!value.size()) continue;
    size_t foundOne = 0, foundTwo = -1;
    string arrString[4];
    for (int i = 0; i < 4; ++i) {
      foundOne =  value.find('\"', foundTwo + 1);
      foundTwo = value.find('\"', foundOne + 1);
      arrString[i] = value.substr(foundOne + 1, foundTwo - foundOne - 1);
    }
    m_userList.push_back(User(arrString[0], arrString[1], arrString[2], arrString[3]));
  }
  fs.close();
  return true;
}

/**
* write file content from memory
* @return if success, true will be returned
*/
bool Storage::writeToFile(void) {
  std::ofstream fs;
  size_t count = 0;
  fs.open(Path::meetingPath, std::ios::out | std::ios::trunc);
  if (!fs.is_open()) return false;
  for (auto it : m_meetingList) {
    count++;
    fs << "\"" << it.getSponsor() << "\",\"";
    std::vector<std::string> partName = it.getParticipator();
    for (std::vector<std::string>::iterator man = partName.begin();
      man != partName.end() ; ++man) {
      if (man != partName.begin()) fs << "&";
      fs << (*man);
    }
    fs << "\",\"" << Date::dateToString(it.getStartDate());
    fs << "\",\"" << Date::dateToString(it.getEndDate());
    fs << "\",\"" << it.getTitle() << "\"";
    if (count != m_meetingList.size()) fs << endl;
  }
  fs.close();

  count = 0;
  fs.open(Path::userPath, std::ios::out | std::ios::trunc);
  if (!fs.is_open()) return false;
  for (auto it : m_userList) {
    count++;
    fs << "\"" << it.getName();
    fs << "\",\"" << it.getPassword();
    fs << "\",\"" << it.getEmail();
    fs << "\",\"" << it.getPhone() << "\"";
    if (count != m_userList.size()) fs << endl;
  }
  fs.close();
  m_dirty = false;
  return true;
}

/**
* get Instance of storage
* @return the pointer of the instance
*/
std::shared_ptr<Storage> Storage::getInstance(void) {
  if (m_instance == nullptr) 
    m_instance = std::shared_ptr<Storage>(new Storage);
  return m_instance;
}
// static

/**
* destructor
*/
Storage::~Storage() {
  sync();
  m_instance = nullptr;
}

// CRUD for User & Meeting
// using C++11 Function Template and Lambda Expressions

/**
* create a user
* @param a user object
*/
void Storage::createUser(const User &t_user) {
  m_userList.push_back(t_user);
  m_dirty = true;
}

/**
* query users
* @param a lambda function as the filter
* @return a list of fitted users
*/
std::list<User> Storage::queryUser(
  std::function<bool(const User &)> filter) const {
  std::list<User> temp;
  for (auto it : m_userList) {
    if (filter(it)) {
      temp.push_back(it);
    }
  }
  return temp;
}

/**
* update users
* @param a lambda function as the filter
* @param a lambda function as the method to update the user
* @return the number of updated users
*/
int Storage::updateUser(std::function<bool(const User &)> filter,
  std::function<void(User &)> switcher) {
  int count = 0;
  for (std::list<User>::iterator it = m_userList.begin();
    it != m_userList.end(); ++it) {
    if (filter(*it)) {
      m_dirty = true;
      count++;
      switcher(*it);
    }
  }
  return count;
}

/**
* delete users
* @param a lambda function as the filter
* @return the number of deleted users
*/
int Storage::deleteUser(std::function<bool(const User &)> filter) {
  int count = 0;
  for (std::list<User>::iterator it = m_userList.begin();
    it != m_userList.end();) {
    if (filter(*it)) {
      ++count;
      m_dirty = true;
      it = m_userList.erase(it);
    } else {
      ++it;
    }
  }
  return count;
}

/**
* create a meeting
* @param a meeting object
*/
void Storage::createMeeting(const Meeting &t_meeting) {
  m_meetingList.push_back(t_meeting);
  m_dirty = true;
}

/**
* query meetings
* @param a lambda function as the filter
* @return a list of fitted meetings
*/
std::list<Meeting> Storage::queryMeeting(
  std::function<bool(const Meeting &)> filter) const {
  std::list<Meeting> temp;
  for (auto it : m_meetingList) {
    if (filter(it)) {
      temp.push_back(it);
    }
  }
  return temp;
}

/**
* update meetings
* @param a lambda function as the filter
* @param a lambda function as the method to update the meeting
* @return the number of updated meetings
*/
int Storage::updateMeeting(std::function<bool(const Meeting &)> filter,
std::function<void(Meeting &)> switcher) {
  int count = 0;
  for (std::list<Meeting>::iterator it = m_meetingList.begin();
    it != m_meetingList.end(); ++it) {
    if (filter(*it)) {
      m_dirty = true;
      count++;
      switcher(*it);
    }
  }
  return count;
}

/**
* delete meetings
* @param a lambda function as the filter
* @return the number of deleted meetings
*/
int Storage::deleteMeeting(std::function<bool(const Meeting &)> filter) {
  int count = 0;
  for (std::list<Meeting>::iterator it = m_meetingList.begin();
    it != m_meetingList.end();) {
    if (filter(*it)) {
      ++count;
      m_dirty = true;
      it = m_meetingList.erase(it);
    } else {
      ++it;
    }
  }
  return count;
}
/**
* sync with the file
*/
bool Storage::sync(void) {
  if (m_dirty) return writeToFile();
  return false;
}
