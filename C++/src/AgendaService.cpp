#include "AgendaService.hpp"
#include "User.hpp"
#include "Meeting.hpp"
#include "Date.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <list>
/**
 * constructor
 */
AgendaService::AgendaService() {
  startAgenda();
}

/**
 * destructor
 */
AgendaService::~AgendaService() {
  quitAgenda();
  m_storage = nullptr;
}

/**
 * check if the userName match password
 * @param userName the userName want to login
 * @param password the password user enter
 * @return if success, true will be returned
 */
bool AgendaService::userLogIn(const std::string &userName, const std::string &password) {
  std::list<User> tmp = m_storage->queryUser([&userName, &password](const User &other)->bool {
    return (other.getName() == userName) && (other.getPassword() == password);  // query userName
  });
  return !tmp.empty();  //no this user and password
}

/**
 * regist a user
 * @param userName new user's userName
 * @param password new user's password
 * @param email new user's email
 * @param phone new user's phone
 * @return if success, true will be returned
 */
bool AgendaService::userRegister(const std::string &userName, const std::string &password,
  const std::string &email, const std::string &phone) {
  std::list<User> tmp = m_storage->queryUser([&userName](const User &other)->bool {
    return (other.getName() == userName);  // query userName
  });
  if (!tmp.empty()) return false;  // had exist this userName
  m_storage->createUser(User(userName, password, email, phone));
  return true;
}

/**
 * delete a user
 * @param userName user's userName
 * @param password user's password
 * @return if success, true will be returned
 */
bool AgendaService::deleteUser(const std::string &userName, const std::string &password) {

  if (m_storage->queryUser([&userName,&password](const User &u)->bool {
    return (u.getName() == userName) && (u.getPassword() == password);
  }).empty()) {
    return false;  // user isn't exist
  }

  deleteAllMeetings(userName);  // delete all meeting which user for sponsor

  int delNum = m_storage->deleteUser([&userName, &password](const User &other)->bool {
    return (other.getName() == userName) && (other.getPassword() == password);  // query userName
  });
  if (!delNum) return false;  // no exsit this user


  m_storage->updateMeeting([&userName](const Meeting &meeting)->bool {
    return meeting.isParticipator(userName);
  },[&userName](Meeting &meeting) {
    meeting.removeParticipator(userName);
  });  //delete user for participator

  m_storage->deleteMeeting([](const Meeting &meeting)->bool {
    return meeting.getParticipator().empty();
  });  //delete null participator meeting
  return true;
}

/**
 * list all users from storage
 * @return a user list result
 */
std::list<User> AgendaService::listAllUsers(void) const{
  return m_storage->queryUser([](const User &other)->bool {return true;});
}

/**
 * create a meeting
 * @param userName the sponsor's userName
 * @param title the meeting's title
 * @param participator the meeting's participator
 * @param startDate the meeting's start date
 * @param endDate the meeting's end date
 * @return if success, true will be returned
 */
bool AgendaService::createMeeting(const std::string &userName, const std::string &title,
 const std::string &startDate, const std::string &endDate, const std::vector<std::string> &participator) {

  if (m_storage->queryUser
    ([&userName](const User &u)->bool {return (u.getName() == userName);}).empty()) {
    return false;  // user isn't exist
  }

  std::list<Meeting> tmp = m_storage->queryMeeting([&title](const Meeting &meeting)->bool {
    return (meeting.getTitle() == title);
  });
  if (!tmp.empty()) {
    return false;  // std::cout << "[create meeting] had exist this meeting"<< std::endl;
  }

  Date m_startDate(startDate);
  Date m_endDate(endDate);
  if (!Date::isValid(m_startDate) || !Date::isValid(m_startDate) || m_startDate >= m_endDate) {
    return false;  // std::cout << "[create meeting] The date isn't valid."<< std::endl;
  }

  std::vector<std::string> hadpartman;
  for (auto manall : participator) {
    int flag = 0;
    for (auto manhad : hadpartman) {
      if (manhad == manall) flag = 1;
    }
    if (flag) {
      return false;  // std::cout << "[create meeting] The participator had exist."<< std::endl;
    }
    hadpartman.push_back(manall);
  }

  std::list<Meeting> aboutme =
    m_storage->queryMeeting([&userName, &m_startDate, &m_endDate](const Meeting &meeting)->bool {
    if ((meeting.getSponsor() != userName) && !meeting.isParticipator(userName)) return false;
    return !(meeting.getStartDate() >= m_endDate || meeting.getEndDate() <= m_startDate);
  });
  if (!aboutme.empty()) {
    return false;  // std::cout << "[create meeting] sponsor has other meeting"<< std::endl;
  }

  for(auto name : participator) {
    std::list<User> actor = m_storage->queryUser([&name](const User &other)->bool {
      return (other.getName() == name);
    });
    if (userName == name) {
      return false;  // std::cout << "[create meeting] the sponsor in the participator"<< std::endl;
    }
    if (actor.empty()) {
      return false;  // std::cout << "[create meeting] no this participator " << name << std::endl;
    }
    std::list<Meeting> aboutother = m_storage->queryMeeting([&name, &m_startDate, &m_endDate](const Meeting &meeting)->bool {
      if ((meeting.getSponsor() != name) && !meeting.isParticipator(name)) return false;
      return !(meeting.getStartDate() >= m_endDate || meeting.getEndDate() <= m_startDate);
    });
    if (!aboutother.empty()) {
      return false;  // std::cout << "[create meeting] particiator has other meeting" << std::endl;
    }
  }
  m_storage->createMeeting(Meeting(userName, participator, m_startDate, m_endDate, title));
  return true;
}

/**
 * add a participator to a meeting
 * @param userName the sponsor's userName
 * @param title the meeting's title
 * @param participator the meeting's participator
 * @return if success, true will be returned
 */
bool AgendaService::addMeetingParticipator(const std::string &userName,
const std::string &title, const std::string &participator) {
  if (m_storage->queryUser
    ([&userName](const User &u)->bool {return (u.getName() == userName);}).empty()) {
    return false;  // no this userName
  }

  std::list<User> actor = m_storage->queryUser([&participator](const User &other)->bool {
      return (other.getName() == participator);
    });
  if (actor.empty())return false;  // no exist this participator

  std::list<Meeting> addto = m_storage->queryMeeting([&title](const Meeting &meeting)->bool {
    return title == meeting.getTitle();
  });
  if(addto.empty())return false;  // no this meeting

  Meeting thisMeeting = addto.front();
  std::list<Meeting> aboutme =
    m_storage->queryMeeting([&participator, &thisMeeting](const Meeting &meeting)->bool {
    if ((meeting.getSponsor() != participator) && !meeting.isParticipator(participator)) return false;
    return !(meeting.getStartDate() >= thisMeeting.getEndDate() || meeting.getEndDate() <= thisMeeting.getStartDate());
  });
  if (!aboutme.empty()) return false;  // participator had other meeting

  return m_storage->updateMeeting([&userName, &title, &participator](const Meeting &meeting)->bool {
    if ((meeting.getSponsor() != userName) || (meeting.getTitle() != title) || userName == participator) return false;
    return !meeting.isParticipator(participator);
  },[&participator](Meeting &meeting) {
    meeting.addParticipator(participator);
  });  // add this participator


}

/**
 * remove a participator from a meeting
 * @param userName the sponsor's userName
 * @param title the meeting's title
 * @param participator the meeting's participator
 * @return if success, true will be returned
 */
bool AgendaService::removeMeetingParticipator(const std::string &userName,
 const std::string &title, const std::string &participator) {
  if (m_storage->queryUser
    ([&userName](const User &u)->bool {return (u.getName() == userName);}).empty()) {
    return false;  // no this userName
  }

  int delNum =
    m_storage->updateMeeting([&userName, &title, &participator](const Meeting &meeting)->bool {
    if ((meeting.getSponsor() != userName) || (meeting.getTitle() != title)) return false;  // this user not sponsor
    return meeting.isParticipator(participator);
  },[&participator](Meeting &meeting) {
    meeting.removeParticipator(participator);
  });  // remove this user
  m_storage->deleteMeeting([](const Meeting &meeting)->bool {
    return meeting.getParticipator().empty();
  });
  return delNum;
}

/**
 * quit from a meeting
 * @param userName the current userName. no need to be the sponsor
 * @param title the meeting's title
 * @return if success, true will be returned
 */
bool AgendaService::quitMeeting(const std::string &userName, const std::string &title) {
  if (m_storage->queryUser
    ([&userName](const User &u)->bool {return (u.getName() == userName);}).empty()) {
    return false;  // no this userName
  }

  int delNum = m_storage->updateMeeting([&userName, &title](const Meeting &meeting)->bool {
    return (meeting.getTitle() == title) && meeting.isParticipator(userName);
  },[&userName](Meeting &meeting) {
    meeting.removeParticipator(userName);
  });
  m_storage->deleteMeeting([](const Meeting &meeting) {
    return meeting.getParticipator().empty();
  });
  return delNum;
}

/**
 * search a meeting by userName and title
 * @param uesrName the sponsor's userName
 * @param title the meeting's title
 * @return a meeting list result
 */
std::list<Meeting> AgendaService::meetingQuery(const std::string &userName,
const std::string &title) const{
  return m_storage->queryMeeting([&userName, &title](const Meeting &meeting)->bool {
    return (meeting.getSponsor() == userName || meeting.isParticipator(userName)) &&
     (meeting.getTitle() == title);
  });
}

/**
 * search a meeting by userName, time interval
 * @param uesrName the sponsor's userName
 * @param startDate time interval's start date
 * @param endDate time interval's end date
 * @return a meeting list result
 */
std::list<Meeting> AgendaService::meetingQuery(const std::string &userName,
const std::string &startDate, const std::string &endDate) const{

  return m_storage->queryMeeting([&userName, &startDate, &endDate](const Meeting &meeting)->bool {
    if (meeting.getSponsor() != userName && !meeting.isParticipator(userName)) return false;  // user isn't sponor
    Date m_startDate(startDate);
    Date m_endDate(endDate);
    if (!Date::isValid(m_startDate) || !Date::isValid(m_startDate) || m_startDate > m_endDate) 
      return false;
    return !(meeting.getStartDate() > m_endDate || meeting.getEndDate() < m_startDate);
  });
}

/**
 * list all meetings the user take part in
 * @param userName user's userName
 * @return a meeting list result
 */
std::list<Meeting> AgendaService::listAllMeetings(const std::string &userName) const{
  return m_storage->queryMeeting([&userName](const Meeting &meeting)->bool {
    return meeting.isParticipator(userName) || (meeting.getSponsor() == userName);
  });
}

/**
 * list all meetings the user sponsor
 * @param userName user's userName
 * @return a meeting list result
 */
std::list<Meeting> AgendaService::listAllSponsorMeetings(const std::string &userName) const{
  return m_storage->queryMeeting([&userName](const Meeting &meeting)->bool {
    return (meeting.getSponsor() == userName);
  });
}

/**
 * list all meetings the user take part in and sponsor by other
 * @param userName user's userName
 * @return a meeting list result
 */
std::list<Meeting> AgendaService::listAllParticipateMeetings(const std::string &userName) const{
  return m_storage->queryMeeting([&userName](const Meeting &meeting)->bool {
    return meeting.isParticipator(userName);
  });
}

/**
 * delete a meeting by title and its sponsor
 * @param userName sponsor's userName
 * @param title meeting's title
 * @return if success, true will be returned
 */

bool AgendaService::deleteMeeting(const std::string &userName, const std::string &title) {
  if (m_storage->queryUser
    ([&userName](const User &u)->bool {return (u.getName() == userName);}).empty()) {
    return false;  // no this userName
  }
  return m_storage->deleteMeeting([&userName, &title](const Meeting &meeting)->bool {
    return (meeting.getSponsor() == userName) && (meeting.getTitle() == title);
  });
}

/**
 * delete all meetings by sponsor
 * @param userName sponsor's userName
 * @return if success, true will be returned
 */

bool AgendaService::deleteAllMeetings(const std::string &userName) {
  if (m_storage->queryUser([&userName]
    (const User &u)->bool {return (u.getName() == userName);}).empty()) {
    return false;  // no this userName
  }
  m_storage->deleteMeeting([&userName](const Meeting &meeting)->bool {
    return (meeting.getSponsor() == userName);
  });  // delete this user meeting for sponsor
  return true;
}

/**
 * start Agenda service and connect to storage
 */
void AgendaService::startAgenda(void) {
  m_storage = Storage::getInstance();
}

/**
 * quit Agenda service
 */
void AgendaService::quitAgenda(void) {
  m_storage->sync();
}
