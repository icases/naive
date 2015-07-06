use strict; 
use Model;
use Encode qw(encode decode);
use Data::Queue::Persistent;



my $q = Data::Queue::Persistent->new(
    table  => 'persistent_queue', # name to save queues in
    dsn    => 'dbi:SQLite:dbname=es_queue.db', # dsn for database to save queues
    id     => 'wordqueue', # queue identifier
    cache  => 1,
    noload => 0, # don't load saved queue automatically
    max_size => 100, # limit to 100 items
  );

my $model=new Model;
$model->import_model("Spanish.model");
my @words=keys %{$model->words()};
my @no_words;
for ($q->length()..100){
	queue_word();
	#push @no_words,$no_word;
}
my $ok=0;
my $wrong=0;
while(){
	my $word_u='';
	my $real=0;
	($word_u,$real)=split(":",$q->remove);
	my $word=decode('utf-8',$word_u);
	my $c='';
	
	while (){
		print encode("utf-8","is \"$word\" spanish? [y/n/q]:");
		$c=<>;
		chomp $c;
		if ($c eq "y"){
			if ($real==1){
				print "GREAT!\n";
				$ok++;
				last;
			} else {
				print "SORRY!\n";
				$wrong++;
				last;
			}
		} elsif ($c eq "n"){
			if ($real==0){
				print "GREAT!\n";
				$ok++;
				last;
			} else {
				print "SORRY!\n";
				$wrong++;
				last;
			}
		}	elsif ($c eq "q"){
			print "bye!";
			
			exit();
		}	else {
			print "$c is not a valid answer\n";
		}
		
		
	}
	print "you get $ok ok and $wrong wrong (",sprintf("%.2f%%",$ok/($ok+$wrong)*100),")\n";
	queue_word();
}

sub queue_word(){
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
	$q->add($word.":".$real);
}
