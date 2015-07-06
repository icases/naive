#
#  test_models
#
#  Created by  on 2009-03-09.
#  Copyright (c) 2009 __MyCompanyName__. All rights reserved.
#


#! /usr/bin/perl -w

use strict; 
use Model;
use Encode qw(encode decode);

my $spanish_model=new Model;
$spanish_model->subs_length(4);
$spanish_model->train("german.txt");
print "hay ",$spanish_model->count(decode("utf-8","ión#"))," palabras que acaban en \"ión\"\n";
print "hay ",$spanish_model->count("#thr")," palabras que empiezan por \"thr\"\n";  
print "caballo ",($spanish_model->exist("vormaligen")?"existe":"no existe"),"\n";
print "skilled ",($spanish_model->exist("skilled")?"existe":"no existe"),"\n";
print "p de vormaligen = ",$spanish_model->p("vormaligen"),"\n"; 
print "p de caballo = ",$spanish_model->p("caballo"),"\n"; 
print encode("utf-8",$spanish_model->generate),"\n" for (0..10); 
$spanish_model->export_model("German.model");

my $english_model=new Model;
$english_model->subs_length(4);
$english_model->train("words.txt"); 
print "hay ",$english_model->count(decode("utf-8","ión#"))," palabras que acaban en \"ión\"\n";
print "hay ",$english_model->count("#thr")," palabras que empiezan por \"thr\"\n"; 
print "caballo ",($english_model->exist("caballo")?"existe":"no existe"),"\n";
print "skilled ",($english_model->exist("skilled")?"existe":"no existe"),"\n";
print "p de caballo = ",$english_model->p("caballo"),"\n"; 
print "p de skilled = ",$english_model->p("skilled"),"\n"; 
print encode("utf-8",$english_model->generate),"\n" for (0..10);
$english_model->export_model("English.model"); 
my $spanish_model2=new Model;
print "DONE\n";
print "IMPORTING\n";
$spanish_model2->import_model("Spanish.model");
print "DONE\n";
print "hay ",$spanish_model2->count(decode("utf-8","ión#"))," palabras que acaban en \"ión\"\n";
print "hay ",$spanish_model2->count("#thr")," palabras que empiezan por \"thr\"\n";  
print "caballo ",($spanish_model2->exist("caballo")?"existe":"no existe"),"\n";
print "skilled ",($spanish_model2->exist("skilled")?"existe":"no existe"),"\n";
print "p de caballo = ",$spanish_model2->p("caballo"),"\n"; 
print "p de skilled = ",$spanish_model2->p("skilled"),"\n"; 
print encode("utf-8",$spanish_model2->generate),"\n" for (0..10);