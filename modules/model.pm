#
#  model
#
#  Created by  on 2009-03-09.
#  Copyright (c) 2009 __MyCompanyName__. All rights reserved.
#


#! /usr/bin/perl -w
     


package Model;
use strict; 
use Encode qw(encode decode); 
                  
sub new {
	my $self = {};
	bless($self);           # but see below
    return $self;
}

sub train {
	my $self=shift;
	my $file=shift;
	open(FILE,$file) || die "cant open file $file for training";
	my (%words,%C);
	my $L=$self->{LENGTH};
	while ($_=decode('UTF-8', <FILE>)){
		chomp; 
		chomp;   
		$words{$_}++;
		$_="#".$_."#";
		next if length($_)<$L;
		for (my $i;$i<length($_)-$L+1;$i++){
			$C{lc substr($_,$i,$L)}++;
		}
	}
	$self->{WORDS}=\%words;
	$self->substrings(\%C);
}
sub export_model (){
	my $self=shift;
	my $file=shift;
	open (FILE,">$file") || die "cant open $file to export model";
	print FILE "\@LENGTH ",$self->{LENGTH},"\n";
	foreach my $word (sort keys %{$self->{WORDS}}) {
		print FILE "\@WORD ",encode("utf-8",$word),"\n";
	}
	foreach my $sub (sort keys %{$self->{SUBS}}) { 
		chomp $sub;
		print FILE "\@SUBS ",encode("utf-8",$sub)," ",$self->{SUBS}->{$sub},"\n" 
	}   
	close(FILE);
}   
sub import_model (){
	my $self=shift;
	my $file=shift;
	open (FILE,"<$file") || die "cant open $file to import model";
	my (%words,%subs);
	while ($_=decode('UTF-8', <FILE>)){
		chomp;       
		my ($key,$data,$value) = split;
		if ($key=~/LENGTH/){
			$self->{LENGTH}=$data;
		}
		if ($key=~/WORD/){
			$words{$data}++;
		}
		if ($key=~/SUBS/){
			$subs{$data}=$value;
		}
	}
	$self->{WORDS}=\%words;
	$self->substrings(\%subs);
}
sub language {
	my $self = shift;
	if (@_) { $self->{LANG} = shift }
	return $self->{LANG};
}

sub subs_length {
	my $self = shift;
	if (@_) { $self->{LENGTH} = shift }
	return $self->{LENGTH};
} 

sub words {
	my $self = shift;
	my $ref= shift;
	if ($ref) { $self->{WORDS} = $ref}
	return $self->{WORDS};
}

sub substrings {
	my $self = shift;
	my $ref= shift;
	if ($ref) { $self->{SUBS} = $ref}
	my $total=0;
	foreach my $sub (keys %{$self->{SUBS}}){
		$total+=$self->{SUBS}->{$sub};
	}                                
	$self->{TOTAL_SUBS}=$total;
	return $self->{SUBS};
}

sub total_subs{
	my $self=shift; 
	return $self->{TOTAL_SUBS};
}  

sub count {
	my $self=shift;
	my $sub=shift;
	return $self->{SUBS}->{$sub};
} 

sub freq {
	my $self=shift;
	my $sub=shift;
	return (($self->{SUBS}->{$sub}+1)/($self->{TOTAL_SUBS}+1));
}

sub exist {
	my $self = shift;       
	my $test =shift;
	return ($self->{WORDS}->{$test}?1:0);
} 

sub p { 
	my $self=shift;
	my $test=shift;  
	my $score=1;
	my $L=$self->{LENGTH};
	for (my $i;$i<length($test)-$L+1;$i++){
		my $dd=lc substr($test,$i,$L); 
		$score*=($self->{SUBS}->{$dd}+1)/($self->{TOTAL_SUBS}+1) 

	}
	return $score;
}

sub generate {
	my $self=shift;
	my $string=_choose($self,""); 
	while (substr($string,-1) ne "#"){
		#print "$string\n"; 
		$string.=substr(_choose($self,substr($string,-$self->{LENGTH}+1)),-1)
	}
	chop $string;
	return substr ($string,1);
}

sub _choose(){ 
	my $self=shift;          
	my $sbs=shift; 
	$sbs="#" unless $sbs;
	#print "$sbs\n"; 
	my $total=0; 
	my @subset=();
	foreach   (keys %{$self->{SUBS}}){
		next unless /^$sbs/; 
		push @subset,$_;
		$total+=$self->{SUBS}->{$_};
	}
	#print "ahoy";   
	my $ticket= rand($total);
    my $counter=0;
   	foreach (@subset){ 
		$counter+=$self->{SUBS}->{$_};
		return $_  if $ticket<$counter;
	}                 
	return ;
}

1;