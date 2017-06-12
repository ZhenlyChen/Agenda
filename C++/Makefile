CC := g++
FLAGS := -std=c++11 -g -Wall
BUL_DIR := build
INC_DIR := include
BIN_DIR := bin
SRC_DIR := src
INCLUDE := -I./$(INC_DIR)

$(BIN_DIR)/main: $(BUL_DIR)/main.o \
	      $(BUL_DIR)/User.o $(BUL_DIR)/Date.o \
          $(BUL_DIR)/Meeting.o $(BUL_DIR)/Storage.o \
          $(BUL_DIR)/AgendaService.o $(BUL_DIR)/AgendaUI.o
	$(CC) $(FLAGS) $(INCLUDE) $^ -o $@

$(BUL_DIR)/%.o: $(SRC_DIR)/%.cpp
	$(CC) $(FLAGS) $(INCLUDE) -c $^ -o $@

clean:
	rm $(BUL_DIR)/* -f
	rm $(BIN_DIR)/* -f

run: $(BIN_DIR)/main
	@$(BIN_DIR)/main

play:
	@echo "Hello, world"

rerun: clean run

zip: clean
	rm ../../backup3.zip -f
	zip -r ../backup3.zip ../Agenda
