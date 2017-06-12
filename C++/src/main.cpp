// Copyright 2017 zhenly
#include <iostream>
#include <csignal>
#include "AgendaUI.hpp"

AgendaUI myAgenda;

static void my_handler(int sig){
	std::cout << std::endl << "Are you sure exit?[y/n]";
	char e;
	std::cin >> e;
	if (e == 'y' || e =='Y'){
		myAgenda.quitAgenda(); // save data.
		std::exit(0);
	} 
}

int main(int argc, char const *argv[]){
	std::signal(SIGINT, my_handler); // ctrl+c
	myAgenda.startAgenda();
	myAgenda.quitAgenda();
	return 0;
}
