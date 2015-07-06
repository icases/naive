#! /usr/bin/perl -w


use Data::Queue::Persistent;
use CGI;
use Data::Serializer;
use Config::General;
use JSON;

sub launch_refill();

use Config::General;
my $conf = new Config::General("../config.txt");
my %conf = $conf->getall;

sub queue_word($);

#my $MODELS_DIR=$conf{MODELS_DIR};
my $DB_DIR=$conf{DB_DIR};

#my $query = new CGI(\*STDIN);
my $query = new CGI();

my $lang=$query->param('lang');


die "$lang is not a valid options. Valid options are ".join(",",@{$conf{LANG}}) unless grep($lang,@{$conf{LANG}});

#open db

my $db_file=$DB_DIR.$lang."_queue.db";
#my $model_file=$MODELS_DIR.$lang.".model";
#print STDERR "language is $lang\n";
#print STDERR "language  db is $db_file\n";

my $serializer=  Data::Serializer->new(
                          serializer => 'JSON',
                        );
$serializer->raw(1);

#get the queue
my $q = Data::Queue::Persistent->new(
    table  => 'persistent_queue', # name to save queues in
    dsn    => "dbi:SQLite:dbname=$db_file", # dsn for database to save queues
    id     => 'wordqueue', # queue identifier
    cache  => 1,
    noload => 0, # don't load saved queue automatically
    max_size => 100, # limit to 100 items
  );



#how many words?
my $n=$query->param('n');
$n=1 unless $n;


my @res;
for (1..$n){
	my $word_u='';
	my $real=0;
	push @res,$serializer->deserialize($q->remove);
	
}

print $query->header(-type=>'txt/json');
print to_json(\@res);

if ($q->length < 10 ){
	if (my $pid = fork() ) {
	
	exit;
	
	} elsif (defined $pid)  {
	
		my $path = $conf{DAEMON_DIR};
		my $scriptName = $conf{DAEMON_NAME}; #name of script to look for

		my $cmd = "ps aux | grep " . $scriptName;
		my $result = `$cmd`;
		my @lines = split("\\n", $result);

		foreach(@lines) {
			#ignore results for the grep command and this script
			unless ($_  =~ m/grep/){
					exit;
			}
		}
		my $launchCMD = "cd $path; ./$scriptName &";
	    system( $launchCMD) or die "couldn't exec : $!";
	} else {
		die "cannot fork :=(";
	}
}




