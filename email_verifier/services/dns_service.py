import dns.asyncresolver
import asyncio

async def get_mx(domain: str) -> dict:
    # Module 4: DNS / MX Check
    resolver = dns.asyncresolver.Resolver()
    
    # Use robust public DNS resolvers (Google + Cloudflare) 
    # to bypass slow or timing-out local network DNS.
    resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']
    
    resolver.timeout = 5
    resolver.lifetime = 10 # Increased lifetime
    
    try:
        try:
            # Force TCP for DNS resolution as the user's network is timing out over UDP (Do53)
            records = await resolver.resolve(domain, 'MX', tcp=True)
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
            # Fallback to A record check as per spec
            try:
                await resolver.resolve(domain, 'A', tcp=True)
                return {
                    "mx_accepts_mail": False,
                    "mx_records": "",
                    "mx_hosts_list": [],
                    "mx_blocked": False,
                    "dns_error": "No MX records found"
                }
            except Exception:
                return {
                    "mx_accepts_mail": False,
                    "mx_records": "",
                    "mx_hosts_list": [],
                    "mx_blocked": False,
                    "dns_error": "Domain does not exist"
                }
        except dns.resolver.NoNameservers: 
            await asyncio.sleep(1)
            records = await resolver.resolve(domain, 'MX')
            
        sorted_records = sorted(records, key=lambda x: x.preference)
        
        mx_hosts_list = []
        raw_records = []
        mx_blocked = False
        
        for r in sorted_records:
            hostname = r.exchange.to_text().rstrip('.')
            if hostname == '0.0.0.0':
                mx_blocked = True
            mx_hosts_list.append(hostname)
            raw_records.append(hostname)
            
        return {
            "mx_accepts_mail": True,
            "mx_records": ";".join(raw_records),
            "mx_hosts_list": mx_hosts_list,
            "mx_blocked": mx_blocked,
            "dns_error": None
        }
        
    except Exception as e:
        return {
            "mx_accepts_mail": False,
            "mx_records": "",
            "mx_hosts_list": [],
            "mx_blocked": False,
            "dns_error": f"DNS Error: {str(e)}"
        }
