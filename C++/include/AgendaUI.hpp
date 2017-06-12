#ifndef AGENDAUI_H
#define AGENDAUI_H

#include <iostream>
#include <string>
#include "AgendaService.hpp"

class AgendaUI {
 public:
  AgendaUI();
  void startAgenda(void);
  void quitAgenda(void);
 private:
  enum textColor{
    BLACK, RED, GREEN, YELLOW, 
    BLUE, PURPLE,DGREEN, WHITE
  };
  
  enum helpText{MAIN, LOGIN};
  
  enum lineClass{TEXT, LINE};
  
  enum windowsInfo{ROW, COL};

  void OperationLoop(void);

  void changeColor(textColor);

  void noneColor(void);

  int getWindowInfo(windowsInfo);

  std::string drawLine(lineClass, std::string str = "");
  
  int getAnyinput(void);
  
  void prinfTextByColor(textColor,std::string);
  
  void prinfHelpText(helpText);
  
  std::string getOperation();

  std::string getOperationWithout();
  
  bool executeOperation(const std::string &t_operation);
  
  bool userLogIn(void);

  void userRegister(void);

  void userLogOut(void);

  bool deleteUser(void);

  void listAllUsers(void);

  void createMeeting(void);

  void addMeetingParticipator(void);

  void removeMeetingParticipator(void);

  void quitMeeting(void);

  void listAllMeetings(void);

  void listAllSponsorMeetings(void);

  void listAllParticipateMeetings(void);

  void queryMeetingByTitle(void);

  void queryMeetingByTimeInterval(void);

  void deleteMeetingByTitle(void);

  void deleteAllMeetings(void);

  void printMeetings(const std::list<Meeting> &t_meetings, std::string title);
  std::string m_userName;
  std::string m_userPassword;
  AgendaService m_agendaService;
};

#endif
