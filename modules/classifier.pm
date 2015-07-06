#
#  classifier
#
#  Created by  on 2009-03-09.
#  Copyright (c) 2009 __MyCompanyName__. All rights reserved.
#


#! /usr/bin/perl -w

package Classifier;
use strict;
use Model;

sub new {
	my $self = {};
	bless($self);           # but see below
    return $self;
} 

sub add_class_with_words {
	my $self=shift;
	my $class_name=shift;
	my $class_file=shift;
	my $class_model=new Model;
	my $class_model->subs_length(4);
	$class_model->train($class_file);
	my $new_class={name=>$class_name,model=>$class_model};
	$self->classes->{$class_name}=$new_class;
}

sub add_class_with_model {
	my $self=shift;
	my $class_name=shift;
	my $class_model=shift;
	my $new_class={name=>$class_name,model=>$class_model};
	$self->{classes}->{$class_name}=$new_class;
}   

sub classes {
	my $self=shift;
	return $self->{classes};
}   


sub check {
    my $self=shift;
    my $word=shift;
	my %scores;
	foreach my $class (keys %{$self->{classes}}){  
		my $model=$self->{classes}->{$class}->{model};
		$scores{$class}=$model->p($word);
	}
	return \%scores;
}   

sub crossvalidate(){
	
}  

1;