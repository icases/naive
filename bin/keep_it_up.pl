#! /usr/bin/perl -w

use strict;
use lib "/Volumes/TheHole/Users/icases/Sites/naive/modules/";
use Model;
use Data::Queue::Persistent;
use Data::Serializer;
use Config::General;
use Tie::File;

sub queue_word($);

my $conf = new Config::General("/Volumes/TheHole/Users/icases/Sites/naive/config.txt");
my %conf = $conf->getall;

my $MODELS_DIR=$conf{MODELS_DIR};
my $DB_DIR=$conf{DB_DIR};
my $LEM_DIR=$conf{LEM_DIR};

my $serializer=  Data::Serializer->new(
                          serializer => 'JSON',
                        );
$serializer->raw(1);

#get the model
my ($db_file,$model_file,$model,@words,$q);
#while (1){
	foreach my $lang (@{$conf{LANG}}){
		print STDERR "updating $lang database\n";
		$db_file=$DB_DIR.$lang."_queue.db";
	
		$q = Data::Queue::Persistent->new(
		    table  => 'persistent_queue', # name to save queues in
		    dsn    => "dbi:SQLite:dbname=$db_file", # dsn for database to save queues
		    id     => 'wordqueue', # queue identifier
		    cache  => 1,
		    noload => 0, # don't load saved queue automatically
		    max_size => 100, # limit to 100 items
		 );
		if ($q->length<100){
			print STDERR "adding ".(100-$q->length)." to $lang database\n";
			$model_file=$MODELS_DIR.$lang.".model";
			$model=new Model;
			$model->import_model($model_file);
			tie @words, 'Tie::File', $LEM_DIR.$lang."_words.txt",discipline => ':encoding(UTF-8)' or die "Could not tie to file: $!";
			#@words=keys %{$model->words()};
			queue_word(100-$q->length);
			print STDERR "done\n";
		} else {
			print STDERR " $lang database is ok\n";
		}
	}
	#sleep(60);
#}

sub queue_word($){
	
	my $n=shift @_;
	foreach (1..$n){
		my ($word,$real);
		if (rand()<0.5){
			$word=$words[rand(scalar @words)];
			$real=1;
		} else {
			$word='';
			do {
				$word=$model->generate();
				} until (!$model->exist($word));
			$real=0;
		}	
		$q->add($serializer->serialize({word=>$word,real=>$real}));
	}
}
