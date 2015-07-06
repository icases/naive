#
#  test_models
#
#  Created by  on 2009-03-09.
#  Copyright (c) 2009 __MyCompanyName__. All rights reserved.
#


#! /usr/bin/perl -w
use Encode qw(encode decode);

$file="lemario-espanol-2002-10-25.txt";
$L=1;

open(FILE,$file) || die "cant open file $file for training";

while ($_=decode('UTF-8', <FILE>)){
	#print encode("UTF-8",$_);
	chomp; 
	chomp;
	   
	#$words{$_}++;
	#$_="#".$_."#";
#next if length($_)<$L;
	$old="";
	for (my $i=0;$i<length($_);$i++){
		 
		$c=lc substr($_,$i,1);
		#next unless $c=~/[a-z]/;
		#print "$old $c\n";
		$C{$old}{$c}++;
		$old=$c;
	}
}

print "Juas\n";
foreach	$c (sort keys %C){
	print "$c:\n";
	foreach $c2 (sort {$C{$c}{$b}<=>$C{$c}{$a}}keys %{$C{$c}}){
		print encode('UTF8',"$c2-> $C{$c}{$c2}\n");
	}
}