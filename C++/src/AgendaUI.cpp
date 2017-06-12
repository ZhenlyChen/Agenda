#include "AgendaUI.hpp"
#include <iostream>
#include <iomanip>
#include <cstdio>
#include <string>
#include <queue>
#include <sys/ioctl.h>
#include <termios.h>
#include <stdlib.h>
#include <csignal>
#include <unistd.h>

using std::cout;
using std::cin;
using std::endl;
using std::string;
using std::list;
using std::setw;

AgendaUI::AgendaUI(){}

string AgendaUI::drawLine(lineClass where, string str){
  int col = getWindowInfo(windowsInfo(COL));
  string output;
  if(where){
    output.append(col, '-');
  } else {
    int leng = (col - str.size()) / 2;
    output.append(leng, '-');
    output.append(str);
    output.append(leng, '-');
    if((col - str.size()) % 2) output.append(1, '-');
  }
  return output;
}

int AgendaUI::getWindowInfo(windowsInfo where){
  struct winsize info;
  ioctl(STDIN_FILENO, TIOCGWINSZ, &info);
  if(where){
    return info.ws_col;
  } else{
    return info.ws_row;
  }
}

int AgendaUI::getAnyinput(void){
  cout << endl << "Press any key to continue..." << endl;
  struct termios oldt, newt;
  int ch;
  tcgetattr(STDIN_FILENO, &oldt);
  newt = oldt;
  newt.c_lflag &= ~(ICANON | ECHO);
  tcsetattr(STDIN_FILENO, TCSANOW, &newt);
  ch = getchar();
  ch = getchar();
  tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
  return ch;
}

void AgendaUI::prinfTextByColor(textColor color,string str){
  printf("\033[1m\033[3%dm%s\033[0m",color, str.c_str());
}

void AgendaUI::changeColor(textColor color){
  printf("\033[3%dm", color);
}

void AgendaUI::noneColor(void){
  printf("\033[1m");
}

void AgendaUI::OperationLoop(void){
  string op = "start";
  printf("\n\033[2J\033[%d;0H", getWindowInfo(windowsInfo(ROW)) / 2 - 10); 
  while(1){
    if(op != "start") op = getOperation();
    if(op == "o" || op == "q"){
      userLogOut();
      prinfTextByColor(textColor(DGREEN), "You've already logged out!");
      break;
    } else if (op == "dc"){
      if(deleteUser()) break;
    } else if (op == "lu"){
      listAllUsers();
    } else if (op == "cm"){
      createMeeting();
    } else if (op == "amp"){
      addMeetingParticipator();
    } else if (op == "rmp"){
      removeMeetingParticipator();
    } else if (op == "rqm"){
      quitMeeting();
    } else if (op == "la"){
      listAllMeetings();
    } else if (op == "fuck"){
      printf("\033[2J\033[0;0H");
      std::exit(0);
    } else if (op == "las"){
      listAllSponsorMeetings();
    } else if (op == "lap"){
      listAllParticipateMeetings();
    } else if (op == "qm"){
      queryMeetingByTitle();
    } else if (op == "qt"){
      queryMeetingByTimeInterval();
    } else if (op == "dm"){
      deleteMeetingByTitle();
    } else if (op == "da"){
      deleteAllMeetings();
    } else if (op == "\n" || op == " "){
      printf("\033[1A");
    } else if (op == "cls"){
      printf("\033[2J\033[0;0H");
    } else if (op == "start" || op == "h" || op == "help"){
      prinfHelpText(helpText(MAIN));
    } else {
      prinfTextByColor(textColor(RED), "Invalid command.\n");
    }
    op = "end";
    prinfTextByColor(textColor(BLUE), "\nAgenda");
    cout <<  "@";
    prinfTextByColor(textColor(GREEN), m_userName);
    cout << ": ~# ";
  }
}
/**
 * constructor
 */
void AgendaUI::prinfHelpText(helpText where){
  if(where){
    cout << endl
         << drawLine(lineClass(TEXT), "|Agenda|") << endl
         << "Action :" << endl
         << "  l      - log in Agenda by user name and password" << endl
         << "  r      - reguster an Agenda account" << endl
         << "  q      - quit Agenda" << endl
         << drawLine(lineClass(LINE)) << endl;
  } else {
    cout << endl
         << drawLine(lineClass(TEXT), "|Agenda|") << endl
         << "Action :" << endl
         << "  o/q    - log out Agenda" << endl
         << "  dc     - delete Agenda account" << endl
         << "  lu     - list all Agenda user" << endl
         << "  cm     - create a meeting" << endl
         << "  amp    - add meeting participator" << endl
         << "  rmp    - remove meeting participator" << endl
         << "  rqm    - request to quit meeting" << endl
         << "  la     - list all meetings" << endl
         << "  las    - list all sponsor meetings" << endl
         << "  lap    - list all participator meetings" << endl
         << "  qm     - query meeting by title" << endl
         << "  qt     - query meeting by time interval" << endl
         << "  dm     - delete meeting by title" << endl
         << "  da     - delete all meetings" << endl
         << "  cls    - clean the screan" << endl
         << "  h      - list all action" << endl
         << drawLine(lineClass(LINE)) << endl;
  }
}

void AgendaUI::startAgenda(void){
  m_agendaService.startAgenda();
  string op = "start";
  printf("\n\033[2J\033[%d;0H",getWindowInfo(windowsInfo(ROW)) / 2 - 4);
  while( op == "start" ||((op = getOperation()) != "q" && op != "Q")){
    // cout << "\n**" << op << "**\n";
    if(op == "r"){
      userRegister();
    } else if (op == "l" || op == "L"){
      if (userLogIn()) prinfHelpText(helpText(LOGIN));
    } else if (op == "fuck"){
      printf("\033[2J\033[0;0H");
      std::exit(0);
    } else if (op == "cls" || op == "CLS"){
      printf("\033[2J\033[0;0H");
    } else if (op == "\n" || op == " "){
      printf("\033[1A");
    } else if (op == "start" || op == "h" || op == "H" || op=="help"){
      prinfHelpText(helpText(LOGIN));
    } else {
      prinfTextByColor(textColor(RED), "Invalid command.\n");
    }
    if(op != " "){
      prinfTextByColor(textColor(BLUE),"\nAgenda");
      cout << ": ~$ ";
    }
    op = "end";
  }
  prinfTextByColor(textColor(YELLOW), "Thanks for using.\n");
  quitAgenda();
}

/**
 * catch user's operation
 * @return the operation
 */

string AgendaUI::getOperation(){
  int ch;
  string input;
  while(input.size() == 0 || (ch != '\n' && ch != ' ')){
    ch = getchar();
    if(!input.size() || (ch != '\n' && ch != ' ')) input.append(1,ch);
  }
  return input;
}

string AgendaUI::getOperationWithout(){
  struct termios oldt, newt;
  int ch;
  string input;
  while(input.size() == 0 || (ch != '\n' && ch != ' ')){
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);
    ch = getchar();
    if(!input.size() || (ch != '\n' && ch != ' ')) input.append(1,ch);
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
  }
  return input;
}


/**
 * execute the operation
 * @return if the OperationLoop continue
 */
bool AgendaUI::executeOperation(const std::string &t_operation){return true;}

/**
 * user Login
 */
bool AgendaUI::userLogIn(void){
  cout << "[log in] [username]" << endl
       << "[log in] ";
  string username = getOperation();
  cout << "[log in] [password]" << endl
       << "[log in] ";
  string password = getOperationWithout();
  if(m_agendaService.userLogIn(username, password)){
    m_userName = username;
    m_userPassword = password;
    cout << "\n[log in] ";
    prinfTextByColor(textColor(GREEN), "success!");
    OperationLoop();
    return true;
  } else{
    cout << "\n[log in] ";
    prinfTextByColor(textColor(RED), "Password error or user doesn't exist");
    return false;
  }
}

/**
 * user regist
 */
void AgendaUI::userRegister(void){
  cout << endl
       << "[register] [username] [password] [email] [phone]" << endl
       << "[register] ";
  string username = getOperation();
  string password = getOperation();
  string email = getOperation();
  string phone = getOperation();
  if(m_agendaService.userRegister(username, password, email, phone)){
    cout << "[register] ";
    prinfTextByColor(textColor(GREEN), "success!\n");
  } else {
    cout << "[register] ";
    prinfTextByColor(textColor(RED), "The username has been registered!\n");
  }
}

/**
 * user logout
 */
void AgendaUI::userLogOut(void){
  m_userName = "";
  m_userPassword = "";
}

/**
 * quit the Agenda
 */
void AgendaUI::quitAgenda(void){
  m_agendaService.quitAgenda();
}

/**
 * delete a user from storage
 */
bool AgendaUI::deleteUser(void){
  prinfTextByColor(textColor(RED), "Are you sure delete your account?[y/n]");
  string op = getOperation();
  if(op == "y" || op == "Y") {
    m_agendaService.deleteUser(m_userName, m_userPassword);
    return true;
  }
  return false;
}

/**
 * list all users from storage
 */
void AgendaUI::listAllUsers(void){
  list<User> users = m_agendaService.listAllUsers();
  cout << endl
       << "[list all users]" << endl;
  cout << drawLine(lineClass(TEXT),"|All Users|");
  printf("\n\033[1m\033[47m\033[30m");
  printf("%-20s%-30s%-20s", "Name", "Email", "Phone");
  string tmp;
  int len = (getWindowInfo(windowsInfo(COL)) - 70);
  if(len > 0) tmp.append(len, ' ');
  cout << tmp;
  printf("\033[0m\n");
  for (auto user : users) {
    printf("%-20s%-30s%-20s\n", 
      user.getName().c_str(), user.getEmail().c_str(), user.getPhone().c_str());
  }
  cout << drawLine(lineClass(LINE));
  // getAnyinput();
}

/**
 * user create a meeting with someone else
 */
void AgendaUI::createMeeting(void){
  cout << endl
       << "[create meeting] [the number of participators]" << endl
       << "[create meeting] ";

  string nums = getOperation();
  std::size_t i = 0;
  int numPeople = 0;
  for (; i < nums.size(); ++i){
    if(nums[i] < '0' || nums[i] > '9') break;
    numPeople += nums[i] - '0';
    if(i != nums.size() - 1) numPeople *= 10;
  }
  if(i != nums.size() || numPeople == 0){
    prinfTextByColor(textColor(RED), "Invalid command.");
    return;
  }

  std::vector<string> participators;
  for (int i = 0; i < numPeople; ++i){
    cout << "[create meeting] [please enter the participator " <<  i + 1 << " ]" << endl
         << "[create meeting] ";
    string name = getOperation();
    participators.push_back(name);
  }

  cout << "[create meeting] [title] [start time(yyyy-mm-dd/hh:mm)] [end time(yyyy-mm-dd/hh:mm)]" << endl
       << "[create meeting] ";
  string title = getOperation();
  string startDate = getOperation();
  string endDate = getOperation();
  cout << "[create meeting] ";
  if(m_agendaService.createMeeting(m_userName, title, startDate, endDate, participators)){
    prinfTextByColor(textColor(GREEN), "success!\n");
  } else {
    prinfTextByColor(textColor(RED), "error!\n");
  }
}

/**
 * sponsor add a participator to the meeting
 */
void AgendaUI::addMeetingParticipator(void){
  cout << endl
       << "[add participator] [meeting title] [participator username]" << endl
       << "[add participator] ";
  string title = getOperation();
  string username = getOperation();
  cout << "[add participator] ";
  if(m_agendaService.addMeetingParticipator(m_userName, title, username)){
    prinfTextByColor(textColor(GREEN), "success!\n");
  } else {
    prinfTextByColor(textColor(RED), "error!\n");
  }
}

/**
 * sponsor add a participator to the meeting
 */
void AgendaUI::removeMeetingParticipator(void){
  cout << endl
       << "[remove participator] [meeting title] [participator username]" << endl
       << "[remove participator] ";
  string title = getOperation();
  string username = getOperation();
  cout << "[remove participator] ";
  if(m_agendaService.removeMeetingParticipator(m_userName, title, username)){
    prinfTextByColor(textColor(GREEN), "success!\n");
  } else {
    prinfTextByColor(textColor(RED), "error!\n");
  }
}

/**
 * user quit from meeting
 */
void AgendaUI::quitMeeting(void){
  cout << endl
       << "[quit meeting] [meeting title]" << endl
       << "[quit meeting] ";
  string title = getOperation();
  cout << "[quit meeting] ";
  if(m_agendaService.quitMeeting(m_userName, title)){
    prinfTextByColor(textColor(GREEN), "success!\n");
  } else {
    prinfTextByColor(textColor(RED), "error!\n");
  }
}

/**
 * list all meetings from storage
 */
void AgendaUI::listAllMeetings(void){
  list<Meeting> meetings = m_agendaService.listAllMeetings(m_userName);
  cout << endl
       << "[list all meetings]";
  printMeetings(meetings, "|All Meetings|");
}

/**
 * list all meetings that this user sponsored
 */
void AgendaUI::listAllSponsorMeetings(void){
  list<Meeting> meetings = m_agendaService.listAllSponsorMeetings(m_userName);
  cout << endl
       << "[list all sponsor meetings]";
  printMeetings(meetings, "|All Meetings|");
}

/**
 * list all meetings that this user take part in
 */
void AgendaUI::listAllParticipateMeetings(void){
  list<Meeting> meetings = m_agendaService.listAllParticipateMeetings(m_userName);
  cout << endl
       << "[list all participator meetings]";
  printMeetings(meetings, "|All Meetings|");
}

/**
 * search meetings by title from storage
 */
void AgendaUI::queryMeetingByTitle(void){
  cout << endl
       << "[query meeting] [title]" << endl
       << "[query meeting] ";
  string title = getOperation();
  list<Meeting> meetings = m_agendaService.meetingQuery(m_userName, title);
  printMeetings(meetings, "|Meetings|");
}

/**
 * search meetings by timeinterval from storage
 */
void AgendaUI::queryMeetingByTimeInterval(void){
  cout << endl
       << "[query meeting] [start time(yyyy-mm-dd/hh:mm)] [end time(yyyy-mm-dd/hh:mm)]" << endl
       << "[query meeting] ";
  string startDate = getOperation();
  string endDate = getOperation();
  list<Meeting> meetings = m_agendaService.meetingQuery(m_userName, startDate, endDate);
  printMeetings(meetings, "|Meetings|");
}

/**
 * delete meetings by title from storage
 */
void AgendaUI::deleteMeetingByTitle(void){
  cout << endl
       << "[delete meeting] [meeting title]" << endl
       << "[delete meeting] ";
  string title = getOperation();
  if(m_agendaService.deleteMeeting(m_userName, title)){
    cout << "[delete meeting] ";
    prinfTextByColor(textColor(GREEN), "succeed!\n");
  } else {
    cout << "[delete meeting] ";
    prinfTextByColor(textColor(RED), "error!\n");
  }
}

/**
 * delete all meetings that this user sponsored
 */
void AgendaUI::deleteAllMeetings(void){
  cout << endl
       << "[delete all meeting] [meeting title]" << endl;
  if(m_agendaService.deleteAllMeetings(m_userName)){
    cout << "[delete all meeting] ";
    prinfTextByColor(textColor(GREEN), "succeed!\n");
  } else {
    cout << "[delete all meeting] ";
    prinfTextByColor(textColor(RED), "error!\n");
  }}

/**
 * show the meetings in the screen
 */
void AgendaUI::printMeetings(const std::list<Meeting> &t_meetings, string title){

  if(t_meetings.empty()){
    cout << endl << drawLine(lineClass(LINE));
    string tmp;
    int len = (getWindowInfo(windowsInfo(COL)) - title.size()) / 2;
    if(len > 0) tmp.append(len, ' ');
    cout << tmp;
    prinfTextByColor(textColor(RED), "No Meetings\n");
  }else{
    cout << endl << drawLine(lineClass(TEXT), title);
    printf("\n\033[47m\033[1m\033[30m");
    printf("%-12s%-12s%-20s%-20s%-18s", "Title", "Sponsor", "Start time", "End time", "Participators");
    string tmp;
    int len = (getWindowInfo(windowsInfo(COL)) - 82);
    if(len > 0) tmp.append(len, ' ');
    cout << tmp;
    printf("\033[0m\n");
  }
  for (auto meeting : t_meetings) {
    printf("%-12s%-12s%-20s%-20s",
      meeting.getTitle().c_str(), meeting.getSponsor().c_str(),
      Date::dateToString(meeting.getStartDate()).c_str(),
      Date::dateToString(meeting.getEndDate()).c_str());
    std::vector<string> participators = meeting.getParticipator();
    int isFirst = 1;
    for (auto man : participators){
      if(isFirst){
        isFirst = 0;
      }else{
        cout << ",";
      }
      cout << man;
    }
    cout << endl;
  }
  cout << drawLine(lineClass(LINE));
  // getAnyinput();
}
// dates