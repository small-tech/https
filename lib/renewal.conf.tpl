#cert = :configDir/live/:hostname/cert.pem
cert = :cert_path
privkey = :privkey_path
chain = :chain_path
fullchain = :fullchain_path

# Options and defaults used in the renewal process
[renewalparams]
no_self_upgrade = True
apache_enmod = a2enmod
no_verify_ssl = False
ifaces = None
apache_dismod = a2dismod
register_unsafely_without_email = False
apache_handle_modules = True
uir = None
installer = None
nginx_ctl = nginx
config_dir = :configDir
text_mode = True
# junk?
# https://github.com/letsencrypt/letsencrypt/issues/1955
func = <function obtain_cert at 0x7f093a163c08>
staging = False
prepare = False
work_dir = :work_dir
tos = :agree_tos
init = False
http01_port = :http_01_port
duplicate = False
noninteractive_mode = True
# this is for the domain
key_path = :privkey_path
nginx = False
nginx_server_root = /etc/nginx
fullchain_path = :fullchain_path
email = :email
csr = None
agree_dev_preview = None
redirect = None
verb = certonly
verbose_count = -3
config_file = None
renew_by_default = True
hsts = False
apache_handle_sites = True
authenticator = webroot
domains = :hostnames #comma,delimited,list
rsa_key_size = :rsa_key_size
apache_challenge_location = /etc/apache2
# starts at 0 and increments at every renewal
checkpoints = -1
manual_test_mode = False
apache = False
cert_path = :cert_path
webroot_path = :webroot_paths # comma,delimited,list
reinstall = False
expand = False
strict_permissions = False
apache_server_root = /etc/apache2
# https://github.com/letsencrypt/letsencrypt/issues/1948
account = :account_id
dry_run = False
manual_public_ip_logging_ok = False
chain_path = :chain_path
break_my_certs = False
standalone = False
manual = False
server = :acme_discovery_url
standalone_supported_challenges = "http-01,tls-sni-01"
webroot = True
os_packages_only = False
apache_init_script = None
user_agent = None
apache_le_vhost_ext = -le-ssl.conf
debug = False
tls_sni_01_port = 443
logs_dir = :logs_dir
apache_vhost_root = /etc/apache2/sites-available
configurator = None
must_staple = False
[[webroot_map]]
# :hostname = :webroot_path
