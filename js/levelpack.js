"use strict";
define([], function () {
	function LevelPack () {
		var mapData = [];
		mapData[0] =
		"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
		"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO   x                      O           O\n" +
		"O !    m      O ! O m O m O   O   x !                    O           O\n" +
		"O OOO OOO OOO O O O O O O O O O OOOOOOOOOOOOOOOO  OOO  OOO    @      O\n" +
		"O OOO OOO OOO k O m O ! O   O   OOOO                   OOO    OO     O\n" +
		"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO                  OOOO    OO  m  O\n" +
		"O O  x                             O               m OOOOO        OO O\n" +
		"O O  x                                         OOOOOOOOOOO     m  OO O\n" +
		"O O  x         O       ! O    m       ! OO  k  O              OO     O\n" +
		"O Oppx  OO     O k    OOOO    OOO    OOOOOOOOOOO          m   OO     O\n" +
		"O OOOOOOOOOOOOOOOOOOOOOOOOOOO OOO  k OOOOOOOOOOO         OO          O\n" +
		"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO      m  OO   !      O\n" +
		"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO     OO      OO      O\n" +
		"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO   m OO      OO      O\n" +
		"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO  OO                 O\n" +
		"O  !                 O       x mm            !    OO                 O\n" +
		"O  O   m O  m O  k O !       x OO           OOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
		"O  OOOOOOOOOOOOOOOOOOO    OOOO OO OOOO OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
		"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
		"";
		mapData[1] =
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
"O       OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
"O       OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOObOOOOOOOOOOOOOOOOOOOOOOOOObOOOOOOOO               OOOOOOOO\n" +
"O       OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO              OOOO    www   OOOO     wwOO               OOOOOOOOOOO\n" +
"O pp  ! O     bOOOOOOOOOOOOOOOOOOOOOOOOOO                                                                   O       OOO\n" +
"OOOOOOO O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO          !                 !             !        s               O       OOO\n" +
"OOOOOOO O OOOOOOOOOOOOOOObOObOObOO OOOOOO      m OOO              OOOO           OOO       OO              !O       OOO\n" +
"OOOOOOO O OOOOOOOOOOOOO                       OO  OOOOOOOOOOOOOOOOOOOO O   O   O OOOOOOOOOOOO        OOOOOOOO @     OOO\n" +
"OOOOOOO                                    OO     OOOOOOOOOOOOOOOOOOOO   O   O   OOOOOOOOOOO bbbbbbbb OOOOOOOOOOOOO OOO\n" +
"OOOOOOO       !       !                 OO        OOOOOOOOOOOOOOOOOOOO           OOOOOOOOOOOO OOOOOOOOOOOOOOOwm    mwOO\n" +
"OOOOOOOOO OOOOO     OOO              !            OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO  O O     OOOOOOOOO O    O OO\n" +
"OOOOOOOOO            OOOO OO OO OO OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO  !  O O     OOOOOOOOO   OO   OO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO OO          OOOOOOOOO        OO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO OOOOOOOOOOOOOOOOOOOOO OOOOOOOOO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOw   wOOOOOOOOOOOOOOOOOOO!m OOOOOOO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO     O    w      w     OOO O\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO     O                 O m O\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO                       O OOO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO                 O m O\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO!s               OOO O\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO   k  k O        ! O\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
""; 

	mapData[2] =
 "OOOOOOOOOOOOOOOOOOO\n" +
"OOOOOOOOOOOOOOOOOOO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
"O             OOOOO            O\n" +
"O OOO OOO OOO OOOOO OOOO OOO O O\n" +
"O             OOOOO            O\n" +
"O                              O\n" +
"O pp          OOOOO          k O\n" +
"O OOO OOO OOO OOOOO OOO OOOO O O\n" +
"O             OOOOO            O\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOO OOOOOO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOO OOOOOO\n" +
"OOOOOOOOOOOOOOOOOOOOOOOOO OOOOOO\n" +
"O             OOOOO      !     O\n" +
"O OOOO OOOO O OOOOO OOO OOO OO O\n" +
"O             OOOOO            O\n" +
"O             OOOOO            O\n" +
"O               !              O\n" +
"O f           OOOOO          f O\n" +
"O OO OOOOO OO OOOOO O OOO OOOO O\n" +
"O             OOOOO            O\n" +
"OOOOOOO OOOOOOOOOOOOOOOOOOOOOOOO\n" +
"OOOOOOO OOOOOOOOOOOOOO\n" +
"O             OOOOOOOO\n" +
"O             OOOOOOOO\n" +
"O O====O====O OOOOOOOO\n" +
"O O    O    O OOOOOOOO\n" +
"O O   fO   fO OOOOOOOO\n" +
"O O  OOO  OOO       @O\n" +
"O             OOOOOOOO\n" +
"O             OOOOOOOO\n" +
"OOOOOOOOOOOOOOOOOOOOOO\n" +
"";

		this.mapData = mapData;
	}
	return LevelPack;
});