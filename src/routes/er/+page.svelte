<script>
	import CreateForm from './CreateForm.svelte';
	import JoinForm from './JoinForm.svelte';
	import github_logo from "$lib/images/github_logo.svg";
	import email_icon from '$lib/images/email_icon.svg';
</script>

<body class="min-h-screen bg-gradient-to-b from-background_dark to-background mt-9">
	<div class="grid grid-cols-2 grid-rows-1 gap-8 p-8">
	  	<div class="row-span-2 bg-primary rounded-lg p-6 shadow-xl hover:scale-105 transition duration-500">
			<CreateForm />
	  	</div>

	  	<div class="bg-primary rounded-lg border-black p-6 shadow-xl hover:scale-105 transition duration-500">
			<JoinForm />
	  	</div>
	  	<div class="bg-primary rounded-lg border-black p-6 shadow-xl hover:scale-105 transition duration-500">
			<div class="grid grid-cols-2 grid-rows-2 gap-7 text-center">
		  		<a class="align-middle" href="/er/help">how to play</a>
		  		<a class="align-middle" href="http://whirlwinda.st/er">
					whirlwindaster
		  		</a>
		  		<a href="https://github.com/whirlwindaster">
					<img class="block mx-auto w-16 h-16" src={github_logo} alt="GitHub Logo"/>
		  		</a>
		  		<a href="mailto:whirlwindaster@gmail.com">
					<img
			  			class="block mx-auto w-16 h-16"
			  			src={email_icon}
			  			alt="Mail Icon"
					/>
		  		</a>
			</div>
	  	</div>
	</div>
</body>