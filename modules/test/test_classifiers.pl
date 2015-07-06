#
#  test_classifiers
#
#  Created by  on 2009-04-07.
#  Copyright (c) 2009 __MyCompanyName__. All rights reserved.
#


#! /usr/bin/perl -w
use lib "..";
use strict;
use Classifier;
use Encode qw(encode decode);

my $classifier=new Classifier;

my $english_model=new Model;
$english_model->import_model("../../models/en.model");

my $spanish_model=new Model;
$spanish_model->import_model("../../models/es.model");

my $german_model=new Model;
$german_model->import_model("../../models/de.model");

my $italian_model=new Model;
$italian_model->import_model("../../models/it.model");

$classifier->add_class_with_model("English",$english_model);
$classifier->add_class_with_model("Spanish",$spanish_model); 
$classifier->add_class_with_model("German",$german_model);
$classifier->add_class_with_model("Italian",$italian_model); 

my @words;
$words[0]= [keys %{$english_model->words}];
$words[3]=[keys %{$spanish_model->words}];
$words[1]=[keys %{$german_model->words}]; 
$words[2]=[keys %{$italian_model->words}]; 

my @langs=("English","German","Italian","Spanish");
my $c=0;  
my %preds;
foreach (0..499){
	my $lang=int(rand(4));
	my $test_word=$words[$lang]->[int(rand(scalar @{$words[$lang]}))]; 
	my $ps=$classifier->check($test_word);
	
	print encode("utf-8",uc($test_word))," $langs[$lang]\n";
	my $pred= max($ps);  
	$preds{$langs[$lang]}{$pred}++;
   	print "predicted: ",$pred,"\n"; 
    $c++ if  ($pred eq $langs[$lang]);
	foreach my $model (sort keys %$ps){
		print "$model $ps->{$model}\n";
	} 
	print "\n";
}                                     

print "$c CORRECTOS!!!\n";
print "\t\tPredichos como: \n";
foreach (sort keys %preds){
		print "\t\t$_";
}  
print "\n";            
foreach my $r (sort keys %preds){ 
	print "Era $r"; 
	foreach my $p (sort keys %{$preds{$r}}){
		print "\t$preds{$r}{$p}";      
	}
	print "\n";
}                  


sub max{
	my $ps=shift;
	my @sorted = sort {$ps->{$a}<=>$ps->{$b}} keys %$ps;
	return pop @sorted;
}



# my $llr_english=log($#english_words/($#english_words+$#spanish_words))+log($ps->{"English"}/$ps->{"Spanish"});
# 
# my $llr_spanish=log($#spanish_words/($#english_words+$#spanish_words))+log($ps->{"Spanish"}/$ps->{"English"}); 
#    
# print "LLR E= $llr_english\n";
# print "LLR S= $llr_spanish\n";  